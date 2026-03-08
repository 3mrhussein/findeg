"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileDown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Papa from "papaparse";
import {
  adminValidateProductImportAction,
  adminProcessProductImportAction,
} from "@/features/administration/application/actions/admin-product-actions";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";

/**
 *
 */
export function ImportWizard() {
  const router = useRouter();
  const t = useTranslations("Common");
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   *
   */
  const handleDownloadTemplate = () => {
    const headers = [
      "sku",
      "name_en",
      "name_ar",
      "description_en",
      "description_ar",
      "brand_id",
      "category_id",
      "base_price",
      "cost_price",
      "barcode",
      "weight_grams",
      "is_active",
    ];
    const example = [
      "STA-88-BLU-04",
      "Stabilo Point 88 - Blue 0.4",
      "ستابيلو بوينت ٨٨ - أزرق ٠.٤",
      "Fine liner pen",
      "قلم تحديد دقيق",
      "1",
      "10",
      "15.50",
      "10.00",
      "4006381333627",
      "10",
      "true",
    ];
    const csvContent = [headers.join(","), example.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "product_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStep(2);
  };

  /**
   *
   */
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  /**
   *
   */
  const handleValidate = () => {
    if (!file) return;
    setIsProcessing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      /**
       *
       */
      complete: async (results) => {
        try {
          const rows = results.data as Record<string, string>[];
          setParsedRows(rows);
          const res = await adminValidateProductImportAction(rows);
          if (res.success) {
            setValidationResult(res.result);
            setStep(3);
          } else {
            toast({
              title: "Error",
              description: res.error || "Validation failed.",
              variant: "destructive",
            });
          }
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to parse CSV.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      },
      /**
       *
       */
      error: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      },
    });
  };

  /**
   *
   */
  const handleProcessImport = async () => {
    setIsProcessing(true);
    const res = await adminProcessProductImportAction(parsedRows);
    setIsProcessing(false);
    if (res.success) {
      setStep(4);
      toast({
        title: "Success",
        description: "Import processing complete.",
      });
    } else {
      toast({
        title: "Error",
        description: res.error || "Import failed.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Progress indicators */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            <span className="text-xs mt-2 text-muted-foreground">
              {s === 1 && "Template"}
              {s === 2 && "Upload"}
              {s === 3 && "Validate"}
              {s === 4 && "Result"}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Download Template</CardTitle>
            <CardDescription>
              Start by downloading our CSV template. Fill it with your products following the
              required columns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md text-sm mb-4">
              <strong>Required Columns:</strong> sku, name_en, name_ar, base_price.
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownloadTemplate}>
              <FileDown className="mr-2 h-4 w-4" /> Download Template
            </Button>
            <Button variant="ghost" onClick={() => setStep(2)} className="ml-auto">
              Skip (I have my file)
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
            <CardDescription>Upload your completed product CSV file here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
              {file ? (
                <div className="text-sm font-medium">{file.name}</div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Drag & drop your CSV file here, or click to select
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} disabled={isProcessing}>
              Back
            </Button>
            <Button onClick={handleValidate} disabled={!file || isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validate Data
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && validationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>Review the data before finalizing the import.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="border p-4 rounded-lg flex flex-col items-center">
                <span className="text-2xl font-bold text-green-600">
                  {validationResult.validCount}
                </span>
                <span className="text-sm text-muted-foreground">Valid Rows</span>
              </div>
              <div className="border p-4 rounded-lg flex flex-col items-center">
                <span className="text-2xl font-bold text-yellow-600">
                  {validationResult.warningCount}
                </span>
                <span className="text-sm text-muted-foreground">Warnings</span>
              </div>
              <div className="border p-4 rounded-lg flex flex-col items-center">
                <span className="text-2xl font-bold text-red-600">
                  {validationResult.errorCount}
                </span>
                <span className="text-sm text-muted-foreground">Errors</span>
              </div>
            </div>

            {validationResult.errorCount > 0 && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Fix errors before importing</h4>
                  <p>
                    You cannot proceed with rows containing errors. Please fix them and re-upload.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} disabled={isProcessing}>
              Upload Again
            </Button>
            <Button
              onClick={handleProcessImport}
              disabled={validationResult.errorCount > 0 || isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Proceed to Import
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Complete</CardTitle>
            <CardDescription>Your products have been processed.</CardDescription>
          </CardHeader>
          <CardContent className="py-12 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold">Successfully Scheduled</h3>
            <p className="text-muted-foreground max-w-sm">
              The valid rows have been processed or queued for background processing. You can safely
              leave this page.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/admin/products")}>Return to Products List</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
