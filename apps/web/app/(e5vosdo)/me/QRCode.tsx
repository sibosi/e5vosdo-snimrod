import React from "react";
import { QRCodeSVG } from "qrcode.react";

const QrCodeGenerator = ({ value }: { value: string }) => {
  return (
    <div className="flex items-center justify-center">
      <QRCodeSVG value={value} size={256} />
    </div>
  );
};

export default QrCodeGenerator;
