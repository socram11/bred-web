import Link from "next/link";

export default function CheckoutPendingPage() {
  return (
    <div className="checkout-page">
      <div>
        <h1>Pago pendiente</h1>
        <p>
          Tu pago está siendo procesado. Te avisamos cuando se confirme.
        </p>
        <Link href="/" className="btn-blk" style={{ display: "inline-block" }}>
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
