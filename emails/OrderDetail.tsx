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

interface ExecutedOrderEmailProps {
  name: string;
  symbol: string;
  orderType: "BUY" | "SELL";
  quantity: number;
  price: number;
  total: number;
  executedAt: string;
}

export default function ExecutedOrderEmail({
  name,
  symbol,
  orderType,
  quantity,
  price,
  total,
  executedAt,
}: ExecutedOrderEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Order Executed</title>

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

      <Preview>
        Your {orderType} order for {symbol} has been successfully executed.
      </Preview>

      <Section>
        <Row>
          <Heading as="h2">Hello {name},</Heading>
        </Row>

        <Row>
          <Text>
            Your <strong>{orderType}</strong> order has been successfully
            executed on our platform. Here are the details of your trade:
          </Text>
        </Row>

        <Row>
          <Text>
            <strong>Stock:</strong> {symbol}
          </Text>
        </Row>

        <Row>
          <Text>
            <strong>Order Type:</strong> {orderType}
          </Text>
        </Row>

        <Row>
          <Text>
            <strong>Quantity:</strong> {quantity}
          </Text>
        </Row>

        <Row>
          <Text>
            <strong>Execution Price:</strong> ₹{price}
          </Text>
        </Row>

        <Row>
          <Text>
            <strong>Total Value:</strong> ₹{total}
          </Text>
        </Row>

        <Row>
          <Text>
            <strong>Executed At:</strong> {executedAt}
          </Text>
        </Row>

        <Row>
          <Text>
            Thank you for trading with us. You can view your portfolio and order
            history in your dashboard anytime.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}