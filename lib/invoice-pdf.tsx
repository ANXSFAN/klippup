import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer
} from "@react-pdf/renderer";
import { formatEUR, type BrandInvoiceSnapshot, type PlatformEntity } from "./invoice";

// Spanish factura layout — A4, two-up header (issuer / recipient), one-line
// concepto, totals on the right. The PDF is the legal artifact; the on-page
// UI just lets users find/download it.

interface InvoiceForPDF {
  serialNumber: string;
  issueDate: Date;
  description: string;
  baseCents: number;
  ivaRatePercent: number;
  ivaCents: number;
  totalCents: number;
  ivaNote: string; // "ES" | "REVERSE_CHARGE" | "EXPORT"
  snapshotPlatform: PlatformEntity;
  snapshotBrand: BrandInvoiceSnapshot;
  status: string; // "PROFORMA" | "ISSUED" | "PAID" | "CANCELLED"
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a"
  },
  watermark: {
    position: "absolute",
    top: 320,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 90,
    color: "#f4f4f5",
    fontFamily: "Helvetica-Bold",
    transform: "rotate(-25deg)"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#ff7a1a"
  },
  meta: { textAlign: "right" },
  metaRow: { marginBottom: 2 },
  metaLabel: { color: "#71717a", fontSize: 8, textTransform: "uppercase" },
  metaValue: { fontFamily: "Helvetica-Bold" },
  parties: {
    flexDirection: "row",
    marginBottom: 28,
    gap: 24
  },
  party: {
    flex: 1,
    borderTop: "1pt solid #e4e4e7",
    paddingTop: 8
  },
  partyLabel: {
    fontSize: 8,
    color: "#71717a",
    textTransform: "uppercase",
    marginBottom: 4
  },
  partyName: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  partyLine: { color: "#3f3f46", marginBottom: 1 },
  conceptTable: {
    border: "1pt solid #e4e4e7",
    marginBottom: 16
  },
  conceptHead: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: "1pt solid #e4e4e7"
  },
  conceptRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  colDesc: { flex: 1 },
  colAmount: { width: 80, textAlign: "right" },
  thLabel: { fontSize: 8, color: "#71717a", textTransform: "uppercase" },
  totals: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16
  },
  totalsBox: { width: 240 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4
  },
  totalGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTop: "1pt solid #1a1a1a",
    marginTop: 4
  },
  grandLabel: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  grandValue: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  notes: {
    fontSize: 9,
    color: "#52525b",
    backgroundColor: "#fafafa",
    padding: 10,
    marginBottom: 12
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#71717a",
    borderTop: "1pt solid #e4e4e7",
    paddingTop: 8,
    textAlign: "center"
  }
});

function ivaNoteText(note: string): string | null {
  if (note === "REVERSE_CHARGE")
    return "Operación con inversión del sujeto pasivo. Art. 84 LIVA. IVA a liquidar por el destinatario.";
  if (note === "EXPORT")
    return "Operación no sujeta a IVA — exportación de servicios fuera de la UE.";
  return null;
}

function statusLabel(s: string): string {
  if (s === "PROFORMA") return "PROFORMA";
  if (s === "PAID") return "PAGADA";
  if (s === "CANCELLED") return "ANULADA";
  return "EMITIDA";
}

function InvoiceDoc({ invoice }: { invoice: InvoiceForPDF }) {
  const platform = invoice.snapshotPlatform;
  const brand = invoice.snapshotBrand;
  const note = ivaNoteText(invoice.ivaNote);
  const showWatermark = invoice.status === "PROFORMA" || invoice.status === "CANCELLED";
  const issueDate = new Date(invoice.issueDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  return (
    <Document
      title={`Factura ${invoice.serialNumber}`}
      author={platform.legalName}
      subject={invoice.description}
    >
      <Page size="A4" style={styles.page}>
        {showWatermark && <Text style={styles.watermark}>{statusLabel(invoice.status)}</Text>}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FACTURA</Text>
            <Text style={{ marginTop: 4, color: "#52525b" }}>{statusLabel(invoice.status)}</Text>
          </View>
          <View style={styles.meta}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Nº de factura</Text>
              <Text style={styles.metaValue}>{invoice.serialNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Fecha de emisión</Text>
              <Text style={styles.metaValue}>{issueDate}</Text>
            </View>
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Emisor</Text>
            <Text style={styles.partyName}>{platform.legalName}</Text>
            <Text style={styles.partyLine}>
              {platform.taxIdType}: {platform.taxId}
            </Text>
            {platform.address.street ? (
              <Text style={styles.partyLine}>{platform.address.street}</Text>
            ) : null}
            <Text style={styles.partyLine}>
              {[platform.address.postalCode, platform.address.city, platform.address.region]
                .filter(Boolean)
                .join(" ")}
            </Text>
            <Text style={styles.partyLine}>{platform.address.country}</Text>
            {platform.email ? (
              <Text style={[styles.partyLine, { marginTop: 4 }]}>{platform.email}</Text>
            ) : null}
          </View>
          <View style={styles.party}>
            <Text style={styles.partyLabel}>Cliente</Text>
            <Text style={styles.partyName}>{brand.legalName || brand.brandName}</Text>
            {brand.legalName && brand.brandName && brand.legalName !== brand.brandName ? (
              <Text style={styles.partyLine}>Marca: {brand.brandName}</Text>
            ) : null}
            {brand.taxId ? (
              <Text style={styles.partyLine}>
                {brand.taxIdType || "NIF"}: {brand.taxId}
              </Text>
            ) : null}
            {brand.address.street ? (
              <Text style={styles.partyLine}>{brand.address.street}</Text>
            ) : null}
            <Text style={styles.partyLine}>
              {[brand.address.postalCode, brand.address.city, brand.address.region]
                .filter(Boolean)
                .join(" ")}
            </Text>
            <Text style={styles.partyLine}>{brand.country || "ES"}</Text>
            {brand.billingEmail ? (
              <Text style={[styles.partyLine, { marginTop: 4 }]}>{brand.billingEmail}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.conceptTable}>
          <View style={styles.conceptHead}>
            <Text style={[styles.colDesc, styles.thLabel]}>Concepto</Text>
            <Text style={[styles.colAmount, styles.thLabel]}>Importe</Text>
          </View>
          <View style={styles.conceptRow}>
            <Text style={styles.colDesc}>{invoice.description}</Text>
            <Text style={styles.colAmount}>{formatEUR(invoice.baseCents)}</Text>
          </View>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Base imponible</Text>
              <Text>{formatEUR(invoice.baseCents)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>IVA ({invoice.ivaRatePercent}%)</Text>
              <Text>{formatEUR(invoice.ivaCents)}</Text>
            </View>
            <View style={styles.totalGrand}>
              <Text style={styles.grandLabel}>TOTAL</Text>
              <Text style={styles.grandValue}>{formatEUR(invoice.totalCents)}</Text>
            </View>
          </View>
        </View>

        {note ? <Text style={styles.notes}>{note}</Text> : null}

        {platform.iban ? (
          <Text style={styles.notes}>
            Forma de pago: transferencia bancaria.{"\n"}
            IBAN: {platform.iban}
            {"\n"}
            Concepto: {invoice.serialNumber}
          </Text>
        ) : null}

        <Text style={styles.footer}>
          {platform.legalName} · {platform.taxIdType}: {platform.taxId} ·{" "}
          {platform.email || ""}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderInvoicePDF(invoice: InvoiceForPDF): Promise<Buffer> {
  // renderToBuffer is the server-side helper; it returns a Node Buffer ready
  // to stream back as application/pdf.
  return renderToBuffer(<InvoiceDoc invoice={invoice} />);
}
