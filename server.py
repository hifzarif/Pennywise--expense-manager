# Server.py
import flwr as fl

#if __name__ == "__main__":
    # Start Flower server (3 rounds for example)
 #   fl.server.start_server(server_address="0.0.0.0:8080", config=fl.server.ServerConfig(num_rounds=3))


import flwr as fl

strategy = fl.server.strategy.FedProx(
    proximal_mu=0.01,  # FedProx μ
    fraction_fit=1.0,
    fraction_evaluate=1.0,
    min_fit_clients=3,
    min_available_clients=3,
    min_evaluate_clients=3,
    on_fit_config_fn=lambda rnd: {"round": rnd},
    on_evaluate_config_fn=lambda rnd: {"round": rnd},
)

fl.server.start_server(
    server_address="0.0.0.0:8080",
    config=fl.server.ServerConfig(num_rounds=3),
    strategy=strategy,
)