'use client'

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #F4A024',
    paddingBottom: 20,
  },
  marketplaceBranding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  marketplaceName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#F4A024',
    marginBottom: 5,
  },
  marketplaceTagline: {
    fontSize: 9,
    color: '#666666',
  },
  invoiceTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  supplierSection: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    marginBottom: 20,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBox: {
    width: '48%',
  },
  label: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
    color: '#1F2937',
    marginBottom: 5,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 10,
    fontFamily: 'Helvetica-Bold',
    borderBottom: '1 solid #E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1 solid #F3F4F6',
  },
  tableCol1: {
    width: '40%',
  },
  tableCol2: {
    width: '15%',
    textAlign: 'center',
  },
  tableCol3: {
    width: '20%',
    textAlign: 'right',
  },
  tableCol4: {
    width: '25%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '45%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 10,
    color: '#1F2937',
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 5,
    borderTop: '2 solid #F4A024',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937',
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#F4A024',
    textAlign: 'right',
  },
  paymentSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
  },
  paymentTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    marginBottom: 5,
  },
  paymentText: {
    fontSize: 9,
    color: '#92400E',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #E5E7EB',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 3,
  },
  statusBadge: {
    padding: '5 10',
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
});

interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  order: {
    order_number: string;
    created_at: string;
  };
  supplier: {
    name: string;
    address?: string;
    city?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  buyer: {
    company_name?: string;
    full_name?: string;
    email?: string;
    address: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  payment_terms?: string;
  notes?: string;
  status: string;
}

interface InvoicePDFDocumentProps {
  data: InvoiceData;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return { bg: '#D1FAE5', text: '#065F46' };
    case 'sent':
      return { bg: '#DBEAFE', text: '#1E40AF' };
    case 'overdue':
      return { bg: '#FEE2E2', text: '#991B1B' };
    default:
      return { bg: '#F3F4F6', text: '#4B5563' };
  }
};

export default function InvoicePDFDocument({ data }: InvoicePDFDocumentProps) {
  const statusColors = getStatusColor(data.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Marketplace Branding */}
        <View style={styles.header}>
          <View style={styles.marketplaceBranding}>
            <View>
              <Text style={styles.marketplaceName}>Paisán</Text>
              <Text style={styles.marketplaceTagline}>
                Latin American B2B Marketplace
              </Text>
              <Text style={[styles.text, { marginTop: 5 }]}>
                connecting buyers with verified suppliers
              </Text>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {data.status.toUpperCase()}
          </Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Invoice Number</Text>
            <Text style={styles.value}>{data.invoice_number}</Text>

            <Text style={styles.label}>Invoice Date</Text>
            <Text style={styles.value}>
              {new Date(data.invoice_date).toLocaleDateString()}
            </Text>

            {data.due_date && (
              <>
                <Text style={styles.label}>Due Date</Text>
                <Text style={styles.value}>
                  {new Date(data.due_date).toLocaleDateString()}
                </Text>
              </>
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.value}>{data.order.order_number}</Text>

            <Text style={styles.label}>Order Date</Text>
            <Text style={styles.value}>
              {new Date(data.order.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Supplier Information */}
        <View style={styles.supplierSection}>
          <Text style={styles.sectionTitle}>From (Supplier)</Text>
          <Text style={styles.supplierName}>{data.supplier.name}</Text>
          {data.supplier.address && <Text style={styles.text}>{data.supplier.address}</Text>}
          {data.supplier.city && data.supplier.country && (
            <Text style={styles.text}>
              {data.supplier.city}, {data.supplier.country}
            </Text>
          )}
          {data.supplier.email && <Text style={styles.text}>{data.supplier.email}</Text>}
          {data.supplier.phone && <Text style={styles.text}>{data.supplier.phone}</Text>}
        </View>

        {/* Buyer Information */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.supplierName}>
            {data.buyer.company_name || data.buyer.full_name}
          </Text>
          {data.buyer.address.street && <Text style={styles.text}>{data.buyer.address.street}</Text>}
          {(data.buyer.address.city || data.buyer.address.state || data.buyer.address.zipCode) && (
            <Text style={styles.text}>
              {data.buyer.address.city}
              {data.buyer.address.state && `, ${data.buyer.address.state}`}
              {data.buyer.address.zipCode && ` ${data.buyer.address.zipCode}`}
            </Text>
          )}
          {data.buyer.address.country && <Text style={styles.text}>{data.buyer.address.country}</Text>}
          {data.buyer.email && <Text style={styles.text}>{data.buyer.email}</Text>}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Description</Text>
            <Text style={styles.tableCol2}>Qty</Text>
            <Text style={styles.tableCol3}>Unit Price</Text>
            <Text style={styles.tableCol4}>Amount</Text>
          </View>

          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCol1}>{item.description}</Text>
              <Text style={styles.tableCol2}>{item.quantity}</Text>
              <Text style={styles.tableCol3}>
                {formatCurrency(item.unit_price, data.currency)}
              </Text>
              <Text style={styles.tableCol4}>
                {formatCurrency(item.amount, data.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(data.subtotal, data.currency)}
            </Text>
          </View>

          {data.shipping_cost > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.shipping_cost, data.currency)}
              </Text>
            </View>
          )}

          {data.tax_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.tax_amount, data.currency)}
              </Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Amount</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(data.total_amount, data.currency)}
            </Text>
          </View>
        </View>

        {/* Payment Terms */}
        {data.payment_terms && (
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>Payment Terms</Text>
            <Text style={styles.paymentText}>{data.payment_terms}</Text>
          </View>
        )}

        {/* Notes */}
        {data.notes && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.text}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This invoice was generated through Paisán Marketplace
          </Text>
          <Text style={styles.footerText}>
            Questions? Contact the supplier directly or reach us at support@paisan.com
          </Text>
          <Text style={[styles.footerText, { marginTop: 5 }]}>
            Thank you for your business!
          </Text>
        </View>
      </Page>
    </Document>
  );
}
