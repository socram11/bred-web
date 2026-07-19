"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatUYU } from "@/lib/mercadopago";
import type { PaymentMethod, Settings, ShippingMethod } from "@/lib/types";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onToast: (msg: string) => void;
  onSuccess: () => void;
}

type PayTab = PaymentMethod;

export function CheckoutModal({
  open,
  onClose,
  settings,
  onToast,
  onSuccess,
}: CheckoutModalProps) {
  const { cart, total, clearCart } = useCart();
  const [tab, setTab] = useState<PayTab>("mercadopago");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("delivery");

  const shippingCost =
    shippingMethod === "delivery" ? settings.shipping_flat_rate : 0;
  const orderTotal = total + shippingCost;

  async function submit(paymentMethod: PaymentMethod) {
    if (!name.trim() || !email.trim()) {
      onToast("Completá tu nombre y email");
      return;
    }
    if (!cart.length) {
      onToast("Tu carrito está vacío");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          shipping_method: shippingMethod,
          payment_method: paymentMethod,
          items: cart,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar el pedido");

      if (paymentMethod === "mercadopago" && data.redirectUrl) {
        clearCart();
        window.location.href = data.redirectUrl;
        return;
      }

      if (paymentMethod === "transfer" || paymentMethod === "cash") {
        clearCart();
        onClose();
        onSuccess();
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, "_blank");
        } else {
          onToast("✓ Pedido confirmado — te contactamos pronto");
        }
        return;
      }

      onToast("✓ Pedido confirmado");
      clearCart();
      onClose();
      onSuccess();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error al procesar");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-ov open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-hd-t">Finalizar compra</span>
          <button className="modal-x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-section">
            <div className="modal-section-title">Tu pedido</div>
            <div className="modal-order-items">
              {cart.map((item) => (
                <div className="modal-order-item" key={item.key}>
                  <span>
                    {item.name} ({item.size}) x{item.qty}
                  </span>
                  <span>{formatUYU(item.price * item.qty)}</span>
                </div>
              ))}
              {shippingCost > 0 && (
                <div className="modal-order-item">
                  <span>Envío</span>
                  <span>{formatUYU(shippingCost)}</span>
                </div>
              )}
            </div>
            <div className="modal-total-row">
              <span className="modal-total-lbl">Total</span>
              <span className="modal-total-val">{formatUYU(orderTotal)}</span>
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Tus datos</div>
            <div className="field">
              <label>Nombre completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            <div className="field">
              <label>Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09X XXX XXX"
              />
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Envío</div>
            <div className="field">
              <select
                value={shippingMethod}
                onChange={(e) =>
                  setShippingMethod(e.target.value as ShippingMethod)
                }
              >
                <option value="delivery">
                  Envío a Uruguay — {formatUYU(settings.shipping_flat_rate)}
                </option>
                <option value="pickup">Retiro en Montevideo — Gratis</option>
              </select>
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Método de pago</div>
            <div className="pay-tabs">
              <button
                className={`pay-tab${tab === "mercadopago" ? " active" : ""}`}
                onClick={() => setTab("mercadopago")}
              >
                📱 Mercado Pago
              </button>
              <button
                className={`pay-tab${tab === "transfer" ? " active" : ""}`}
                onClick={() => setTab("transfer")}
              >
                🏦 Transferencia
              </button>
              <button
                className={`pay-tab${tab === "cash" ? " active" : ""}`}
                onClick={() => setTab("cash")}
              >
                💵 Efectivo
              </button>
            </div>

            <div
              className={`pay-panel${tab === "mercadopago" ? " active" : ""}`}
            >
              <p
                style={{
                  fontSize: 13,
                  color: "#555",
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                Serás redirigido a Mercado Pago para completar tu pago de forma
                segura. Podés pagar con tarjeta, saldo MP, Rapipago y más.
              </p>
              <button
                className="mp-btn"
                disabled={loading}
                onClick={() => submit("mercadopago")}
              >
                <span style={{ fontSize: 20 }}>📱</span> Pagar con Mercado Pago
              </button>
              <div className="secure-badge">🔒 Protegido por Mercado Pago</div>
            </div>

            <div
              className={`pay-panel${tab === "transfer" ? " active" : ""}`}
            >
              <div className="transferencia-info">
                <strong>Datos para transferir:</strong>
                {settings.bank_transfer_info}
                {"\n\n"}
                <strong>Importante:</strong>
                Una vez realizada la transferencia, enviá el comprobante por
                Instagram <strong>{settings.instagram_handle}</strong> y
                coordinamos el envío.
              </div>
              <button
                className="pay-btn"
                disabled={loading}
                onClick={() => submit("transfer")}
              >
                Confirmar pedido por transferencia
              </button>
            </div>

            <div className={`pay-panel${tab === "cash" ? " active" : ""}`}>
              <div className="transferencia-info">
                <strong>Pago en persona:</strong>
                Podés abonar en efectivo al retirar tu pedido en Montevideo o
                contra entrega según disponibilidad.
                {"\n\n"}
                <strong>Coordinar retiro:</strong>
                Escribinos por Instagram{" "}
                <strong>{settings.instagram_handle}</strong> para acordar lugar
                y horario.
              </div>
              <button
                className="pay-btn"
                disabled={loading}
                onClick={() => submit("cash")}
              >
                Confirmar pedido — pago en persona
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
