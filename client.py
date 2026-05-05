import flwr as fl
import tensorflow as tf
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# FedProx parameter
MU = 0.01


# -------------------- DATA LOADING --------------------
def load_data(file_path: str):
    df = pd.read_csv(file_path)

    cols = ['Date', 'Category', 'Subcategory', 'INR', 'Income/Expense']
    df = df[cols].copy()

    df['Date'] = pd.to_datetime(df['Date'], format='%m/%d/%Y %H:%M', errors='coerce')
    df['Month'] = df['Date'].dt.month.astype('category')

    df['INR'] = pd.to_numeric(df['INR'].astype(str).str.replace(',', ''), errors='coerce')
    df['is_expense'] = (df['Income/Expense'] == 'Expense').astype(int)

    cat_cols = ['Category', 'Subcategory', 'Month']
    df_enc = pd.get_dummies(df[cat_cols], drop_first=True)

    X = pd.concat([df_enc, df[['INR']]], axis=1)
    y = df['is_expense'].values

    scaler = StandardScaler()
    X[['INR']] = scaler.fit_transform(X[['INR']])

    X = X.values.astype(np.float32)
    y = y.astype(np.float32)

    x_train, x_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    return x_train, y_train, x_test, y_test


# -------------------- MODEL --------------------
def create_model(input_shape):
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(64, activation='relu', input_shape=(input_shape,)),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')  # Binary classification
    ])
    return model


# -------------------- CLIENT --------------------
class FedProxClient(fl.client.NumPyClient):
    def __init__(self, data_path):
        self.x_train, self.y_train, self.x_test, self.y_test = load_data(data_path)
        self.model = create_model(self.x_train.shape[1])
        self.global_weights = None

    def get_parameters(self, config):
        return self.model.get_weights()

    def fit(self, parameters, config):
        self.global_weights = parameters
        self.model.set_weights(parameters)

        # FedProx Loss
        def fedprox_loss(y_true, y_pred):
            base_loss = tf.keras.losses.binary_crossentropy(y_true, y_pred)
            prox_term = tf.add_n([
                tf.nn.l2_loss(w - gw)
                for w, gw in zip(self.model.trainable_weights, self.global_weights)
            ])
            return base_loss + MU * prox_term

        self.model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss=fedprox_loss,
            metrics=["accuracy"]
        )

        self.model.fit(
            self.x_train,
            self.y_train,
            epochs=3,
            batch_size=32,
            verbose=1
        )

        return self.model.get_weights(), len(self.x_train), {}

    def evaluate(self, parameters, config):
        self.model.set_weights(parameters)
        loss, acc = self.model.evaluate(self.x_test, self.y_test, verbose=0)
        return loss, len(self.x_test), {"accuracy": acc}


# -------------------- START CLIENT --------------------
def main():
    fl.client.start_numpy_client(
        server_address="127.0.0.1:8080",
        client=FedProxClient("expense_data_1.csv")
    )


if __name__ == "__main__":
    print("Starting client...")
    main()