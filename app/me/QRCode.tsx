import React from "react";
import QRCode from "qrcode.react";

const QrCodeGenerator = ({ value }: { value: string }) => {
  return (
    <div className="flex justify-center items-center">
      <QRCode value={value} size={256} />
    </div>
  );
};

export default QrCodeGenerator;
