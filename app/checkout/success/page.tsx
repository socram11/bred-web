import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="checkout-page">
      <div>
        <h1>¡Pago confirmado!</h1>
        <p>
          Gracias por tu compra. Te vamos a contactar pronto con los detalles
          del envío o retiro.
        </p>
        <Link href="/" className="btn-blk" style={{ display: "inline-block" }}>
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
