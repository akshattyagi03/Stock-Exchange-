import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface TradeExecutedEmailProps {
  name: string;
  orderId: string;
  stockName: string;
  orderType: "buy" | "sell";
  quantity: number;
  executedPrice: number;
  totalValue: number;
  executedAt: string;
}

export default function TradeExecutedEmail({
  name,
  orderId,
  stockName,
  orderType,
  quantity,
  executedPrice,
  totalValue,
  executedAt,
}: TradeExecutedEmailProps) {
  const isBuy = orderType === "buy";

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Trade Executed</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your {orderType} order for {stockName} has been executed</Preview>
      <Section style={{ fontFamily: "Roboto, Verdana, sans-serif", padding: "24px", maxWidth: "480px" }}>
        <Row>
          <Heading as="h2" style={{ marginBottom: "8px" }}>
            Trade Executed ✅
          </Heading>
        </Row>
        <Row>
          <Text>Hi {name},</Text>
        </Row>
        <Row>
          <Text>
            Your <strong>{orderType.toUpperCase()}</strong> order has been successfully executed. Here are the details:
          </Text>
        </Row>

        <Section
          style={{
            backgroundColor: isBuy ? "#f0fdf4" : "#fff1f2",
            border: `1px solid ${isBuy ? "#bbf7d0" : "#fecdd3"}`,
            borderRadius: "8px",
            padding: "16px",
            margin: "16px 0",
          }}
        >
          <Text style={{ margin: "4px 0" }}><strong>Order ID:</strong> {orderId}</Text>
          <Text style={{ margin: "4px 0" }}><strong>Stock:</strong> {stockName}</Text>
          <Text style={{ margin: "4px 0" }}><strong>Type:</strong> {isBuy ? "Buy 📈" : "Sell 📉"}</Text>
          <Text style={{ margin: "4px 0" }}><strong>Quantity:</strong> {quantity}</Text>
          <Text style={{ margin: "4px 0" }}><strong>Executed Price:</strong> ₹{executedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          <Text style={{ margin: "4px 0" }}><strong>Total Value:</strong> ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
          <Text style={{ margin: "4px 0" }}><strong>Executed At:</strong> {executedAt}</Text>
        </Section>

        <Row>
          <Text style={{ color: "#6b7280", fontSize: "12px" }}>
            If you did not place this order, please contact support immediately.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
