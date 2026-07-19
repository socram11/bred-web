import Link from "next/link";

export default function CheckoutFailurePage() {
  return (
    <div className="checkout-page">
      <div>
        <h1>Pago no completado</h1>
        <p>
          El pago no se procesó. Podés intentar de nuevo o elegir otro método de
          pago.
        </p>
        <Link href="/" className="btn-blk" style={{ display: "inline-block" }}>
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
