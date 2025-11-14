'use client';

import * as React from 'react';
import { collection, writeBatch } from 'firebase/firestore';
import { Loader2, UploadCloud } from 'lucide-react';
import { extractTransactionsFromImage } from '@/ai/flows/extract-transactions-from-image';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function UploadTransactionsDialog() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !firestore) {
      toast({
        title: 'Error',
        description: 'Please select a file and ensure you are signed in.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async (event) => {
        const imageDataUri = event.target?.result as string;
        try {
          const result = await extractTransactionsFromImage({ imageDataUri });

          if (result.transactions.length === 0) {
            toast({
              title: 'No transactions found',
              description: 'The AI could not find any transactions in the uploaded image.',
              variant: 'destructive',
            });
            setIsProcessing(false);
            return;
          }

          const batch = writeBatch(firestore);
          const transactionsCollection = collection(firestore, 'users', user.uid, 'transactions');

          result.transactions.forEach((tx) => {
            const docRef = collection(firestore, 'users', user.uid, 'transactions').doc();
            batch.set(docRef, {
              name: tx.name,
              amount: tx.amount,
              date: new Date(tx.date),
              type: 'Expense',
              category: 'Other', // Default category
              userId: user.uid,
            });
          });

          await batch.commit();

          toast({
            title: 'Success!',
            description: `${result.transactions.length} transaction(s) added successfully.`,
          });

          setOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
        } catch (aiError) {
          console.error('AI processing error:', aiError);
          toast({
            title: 'AI Processing Error',
            description: 'Could not extract transactions from the image. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (error) {
      console.error('File reading error:', error);
      toast({
        title: 'File Error',
        description: 'There was an issue reading the selected file.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <UploadCloud className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Upload Screenshot</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload UPI Screenshot</DialogTitle>
          <DialogDescription>
            Upload an image of your UPI transaction to automatically extract the details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {selectedFile ? 'Change Image' : 'Select Image'}
          </Button>
          {previewUrl && (
            <div className="relative w-full aspect-video rounded-md overflow-hidden border">
              <Image src={previewUrl} alt="Selected preview" layout="fill" objectFit="contain" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upload and Extract'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
