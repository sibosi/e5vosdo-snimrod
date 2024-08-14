import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const BarcodeGenerator = ({ value }: { value: string }) => {
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, value, {
        format: "CODE128",
        displayValue: true,
        fontSize: 20,
        height: 100,
      });
    }
  }, [value]);

  return (
    <div className="flex justify-center items-center">
      <canvas ref={barcodeRef} />
    </div>
  );
};

export default BarcodeGenerator;
