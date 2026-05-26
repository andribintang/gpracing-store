'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Tag, Check, Loader2 } from 'lucide-react';
import { getCart, getProvinces, getCities, getOngkir, checkVoucher, createOrder } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

type Province = { province_id: string; province: string };
type City     = { city_id: string; city_name: string; type: string; postal_code: string };
type Courier  = { code: string; name: string; costs: { service: string; description: string; cost: { value: number; etd: string }[] }[] };

const COURIERS = ['jne','tiki','pos'];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, setCart } = useCartStore();
  const { customer } = useAuthStore();

  // Form
  const [name,    setName]    = useState(customer?.name || '');
  const [email,   setEmail]   = useState(customer?.email || '');
  const [phone,   setPhone]   = useState(customer?.phone || '');
  const [address, setAddress] = useState('');

  // Shipping
  const [provinces,   setProvinces]   = useState<Province[]>([]);
  const [cities,      setCities]      = useState<City[]>([]);
  const [province,    setProvince]    = useState('');
  const [city,        setCity]        = useState('');
  const [postal,      setPostal]      = useState('');
  const [couriers,    setCouriers]    = useState<Courier[]>([]);
  const [selectedShip,setSelectedShip]= useState<{ courier: string; service: string; cost: number; etd: string } | null>(null);
  const [loadingShip, setLoadingShip] = useState(false);

  // Voucher
  const [voucherCode,    setVoucherCode]    = useState('');
  const [voucherApplied, setVoucherApplied] = useState<{ code: string; discount: number; type: string } | null>(null);
  const [checkingVoucher,setCheckingVoucher]= useState(false);

  // Order
  const [placing, setPlacing] = useState(false);

  // Total weight estimation (500g per item)
  const totalWeight = items.reduce((s: any, i: any) => s + (i.quantity * 500), 0);

  useEffect(() => {
    getCart().then(r => setCart(r.data.data.items, r.data.data.subtotal)).catch(() => {});
    getProvinces().then(r => setProvinces(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (province) {
      getCities(Number(province)).then(r => setCities(r.data.data)).catch(() => {});
      setCity(''); setCouriers([]); setSelectedShip(null);
    }
  }, [province]);

  const handleCheckOngkir = async () => {
    if (!city) { toast.error('Pilih kota tujuan'); return; }
    setLoadingShip(true);
    try {
      const results = await Promise.all(
        COURIERS.map(c => getOngkir({ origin: '501', destination: city, weight: totalWeight, courier: c })
          .then(r => r.data.data).catch(() => []))
      );
      setCouriers(results.flat());
    } catch { toast.error('Gagal cek ongkir'); }
    finally { setLoadingShip(false); }
  };

  const handleCheckVoucher = async () => {
    if (!voucherCode.trim()) return;
    setCheckingVoucher(true);
    try {
      const r = await checkVoucher({ code: voucherCode, brand: 'gpracing', subtotal });
      const d = r.data.data;
      setVoucherApplied({ code: voucherCode.toUpperCase(), discount: d.discount, type: d.type });
      toast.success(`Voucher berhasil! Hemat ${fmt(d.discount)}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Voucher tidak valid');
      setVoucherApplied(null);
    } finally { setCheckingVoucher(false); }
  };

  const handleOrder = async () => {
    if (!name || !email || !phone || !address) { toast.error('Lengkapi data pemesan'); return; }
    if (!province || !city)   { toast.error('Pilih provinsi dan kota'); return; }
    if (!selectedShip)        { toast.error('Pilih layanan pengiriman'); return; }
    if (items.length === 0)   { toast.error('Keranjang kosong'); return; }

    setPlacing(true);
    try {
      const selectedCity  = cities.find(c => c.city_id === city);
      const selectedProv  = provinces.find(p => p.province_id === province);

      const r = await createOrder({
        brand: 'gpracing',
        customer_name: name, customer_email: email, customer_phone: phone,
        shipping_address: address,
        shipping_city:    selectedCity?.city_name,
        shipping_province:selectedProv?.province,
        shipping_postal:  postal || selectedCity?.postal_code,
        shipping_courier: selectedShip.courier.toUpperCase(),
        shipping_service: selectedShip.service,
        shipping_cost:    selectedShip.cost,
        shipping_etd:     selectedShip.etd,
        items: items.map((i: any) => ({ product_id: i.product_id, variant: i.variant, quantity: i.quantity })),
        voucher_code: voucherApplied?.code,
      });

      const { midtrans_token, order } = r.data.data;

      // Open Midtrans Snap
      if ((window as any).snap && midtrans_token) {
        (window as any).snap.pay(midtrans_token, {
          onSuccess: () => router.push(`/orders/${order.id}?status=success`),
          onPending: () => router.push(`/orders/${order.id}?status=pending`),
          onError:   () => toast.error('Pembayaran gagal'),
          onClose:   () => toast('Pembayaran dibatalkan'),
        });
      } else {
        router.push(`/orders/${order.id}`);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Gagal membuat order');
    } finally { setPlacing(false); }
  };

  const shippingCost  = selectedShip?.cost || 0;
  const voucherDiscount = voucherApplied?.type === 'free_ongkir' ? shippingCost : (voucherApplied?.discount || 0);
  const grandTotal    = subtotal + shippingCost - voucherDiscount;

  return (
    <div className="container py-12">
      <h1 className="font-display mb-10" style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', color: 'var(--brand)' }}>CHECKOUT</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left — form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer info */}
          <section>
            <h2 className="font-display text-2xl tracking-widest mb-5 text-[var(--brand)]">DATA PEMESAN</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Nama Lengkap *</label>
                <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Nama penerima" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2">No. WhatsApp *</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="08xxxxxxxxx" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="email@example.com" />
              </div>
            </div>
          </section>

          {/* Shipping address */}
          <section>
            <h2 className="font-display text-2xl tracking-widest mb-5 text-[var(--brand)]">ALAMAT PENGIRIMAN</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Alamat Lengkap *</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)}
                  rows={3} className="input resize-none" placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Provinsi *</label>
                  <div className="relative">
                    <select value={province} onChange={e => setProvince(e.target.value)} className="input appearance-none pr-8">
                      <option value="">Pilih Provinsi</option>
                      {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Kota/Kabupaten *</label>
                  <div className="relative">
                    <select value={city} onChange={e => { setCity(e.target.value); setSelectedShip(null); setCouriers([]); }} className="input appearance-none pr-8" disabled={!province}>
                      <option value="">Pilih Kota</option>
                      {cities.map(c => <option key={c.city_id} value={c.city_id}>{c.type} {c.city_name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2">Kode Pos</label>
                  <input value={postal} onChange={e => setPostal(e.target.value)} className="input" placeholder="12345" />
                </div>
              </div>

              <button onClick={handleCheckOngkir} disabled={!city || loadingShip}
                className="btn-outline py-3 px-6 flex items-center gap-2 disabled:opacity-50">
                {loadingShip ? <Loader2 size={16} className="animate-spin" /> : null}
                Cek Ongkir
              </button>
            </div>

            {/* Courier options */}
            {couriers.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3">Pilih Layanan Pengiriman</p>
                {couriers.map(courier =>
                  courier.costs?.map(svc => {
                    const cost = svc.cost[0];
                    const key = `${courier.code}-${svc.service}`;
                    const isSelected = selectedShip?.courier === courier.code && selectedShip?.service === svc.service;
                    return (
                      <label key={key}
                        className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${isSelected ? 'border-[var(--brand)] bg-[var(--brand)]/5' : 'border-[var(--border)] hover:border-[var(--brand)]/40'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[var(--brand)] bg-[var(--brand)]' : 'border-[var(--border)]'}`}>
                            {isSelected && <Check size={10} className="text-white" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm uppercase">{courier.code} {svc.service}</p>
                            <p className="text-xs text-[var(--text-muted)]">{svc.description} · Est. {cost?.etd || '?'} hari</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{fmt(cost?.value || 0)}</p>
                          <input type="radio" name="shipping" className="sr-only"
                            checked={isSelected}
                            onChange={() => setSelectedShip({ courier: courier.code, service: svc.service, cost: cost?.value || 0, etd: cost?.etd || '' })} />
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </section>

          {/* Voucher */}
          <section>
            <h2 className="font-display text-2xl tracking-widest mb-5 text-[var(--brand)]">VOUCHER</h2>
            {voucherApplied ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Check size={18} className="text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800 uppercase tracking-wide">{voucherApplied.code}</p>
                    <p className="text-sm text-green-600">Hemat {fmt(voucherDiscount)}</p>
                  </div>
                </div>
                <button onClick={() => { setVoucherApplied(null); setVoucherCode(''); }}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-wide">
                  Hapus
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    className="input pl-10 uppercase tracking-widest" placeholder="KODE VOUCHER" />
                </div>
                <button onClick={handleCheckVoucher} disabled={checkingVoucher || !voucherCode}
                  className="btn-outline px-6 disabled:opacity-50 flex items-center gap-2">
                  {checkingVoucher ? <Loader2 size={14} className="animate-spin" /> : null}
                  Pakai
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right — summary */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--brand)] text-white p-8 sticky top-24">
            <h2 className="font-display text-2xl tracking-widest mb-6">ORDER SUMMARY</h2>

            {/* Items */}
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
              {items.map((item: any) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="relative w-12 h-12 flex-shrink-0 bg-white/10">
                    {item.product?.images?.[0] && (
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] rounded-full text-xs flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-white/80">{item.product?.name}</p>
                    {item.variant && Object.keys(item.variant).length > 0 && (
                      <p className="text-white/40 text-xs">{Object.values(item.variant).join(' / ')}</p>
                    )}
                  </div>
                  <p className="font-bold flex-shrink-0">{fmt(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Ongkir {selectedShip ? `(${selectedShip.courier.toUpperCase()} ${selectedShip.service})` : ''}</span>
                <span>{selectedShip ? fmt(shippingCost) : '–'}</span>
              </div>
              {voucherApplied && (
                <div className="flex justify-between text-sm text-green-300">
                  <span>Voucher {voucherApplied.code}</span>
                  <span>– {fmt(voucherDiscount)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>{fmt(grandTotal)}</span>
              </div>
            </div>

            <button onClick={handleOrder} disabled={placing || items.length === 0}
              className="btn-accent w-full py-4 mt-6 text-base flex items-center justify-center gap-3 disabled:opacity-60">
              {placing ? <Loader2 size={18} className="animate-spin" /> : null}
              {placing ? 'Memproses...' : 'Bayar Sekarang'}
            </button>

            <p className="text-center text-xs text-white/30 mt-4 uppercase tracking-widest">
              Pembayaran aman via Midtrans
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
