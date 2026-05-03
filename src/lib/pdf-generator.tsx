import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#333333",
    borderBottomStyle: "solid",
  },
  meta: { fontSize: 10, color: "#666666", marginBottom: 20 },
  metaRow: { marginBottom: 4 },
  table: { marginTop: 20 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f4f4f4",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
    padding: 8,
    backgroundColor: "#ffffff",
  },
  tableRowEven: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
    padding: 8,
    backgroundColor: "#f9f9f9",
  },
  tableRowTotal: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
    padding: 8,
    backgroundColor: "#e8e8e8",
  },
  col1: { width: "20%", fontSize: 9 },
  col2: { width: "13%", fontSize: 9, textAlign: "right" },
  col3: { width: "13%", fontSize: 9, textAlign: "right" },
  col4: { width: "13%", fontSize: 9, textAlign: "right" },
  col5: { width: "18%", fontSize: 9, textAlign: "right" },
  col6: { width: "23%", fontSize: 9, textAlign: "right" },
  headerText: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  totalLabel: { width: "77%", fontSize: 9, fontFamily: "Helvetica-Bold" },
  totalValue: { width: "23%", fontSize: 9, textAlign: "right", fontFamily: "Helvetica-Bold" },
});

interface HoldingData {
  stockName: string;
  availableQuantity: number;
  frozenQuantity: number;
  totalQty: number;
  averageBuyPrice: number;
  investment: number;
}

interface HoldingsPDFProps {
  userName: string;
  generatedDate: string;
  totalHoldings: number;
  holdings: HoldingData[];
  totalInvestment: number;
}

function formatINR(value: number): string {
  return "Rs. " + value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function HoldingsPDFDocument({
  userName,
  generatedDate,
  totalHoldings,
  holdings,
  totalInvestment,
}: HoldingsPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <Text style={styles.title}>Holdings Report</Text>

        <View style={styles.meta}>
          <Text style={styles.metaRow}>User: {userName}</Text>
          <Text style={styles.metaRow}>Generated: {generatedDate}</Text>
          <Text style={styles.metaRow}>Total Holdings: {totalHoldings}</Text>
        </View>

        <View style={styles.table}>

          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.headerText]}>Stock</Text>
            <Text style={[styles.col2, styles.headerText]}>Available</Text>
            <Text style={[styles.col3, styles.headerText]}>Frozen</Text>
            <Text style={[styles.col4, styles.headerText]}>Total Qty</Text>
            <Text style={[styles.col5, styles.headerText]}>Avg Price</Text>
            <Text style={[styles.col6, styles.headerText]}>Investment</Text>
          </View>

          {holdings.map((holding, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}
            >
              <Text style={styles.col1}>{holding.stockName}</Text>
              <Text style={styles.col2}>{holding.availableQuantity}</Text>
              <Text style={styles.col3}>{holding.frozenQuantity}</Text>
              <Text style={styles.col4}>{holding.totalQty}</Text>
              <Text style={styles.col5}>{formatINR(holding.averageBuyPrice)}</Text>
              <Text style={styles.col6}>{formatINR(holding.investment)}</Text>
            </View>
          ))}

          <View style={styles.tableRowTotal}>
            <Text style={styles.totalLabel}>Total Investment</Text>
            <Text style={styles.totalValue}>{formatINR(totalInvestment)}</Text>
          </View>

        </View>
      </Page>
    </Document>
  );
}