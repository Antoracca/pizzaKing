import { NextRequest, NextResponse } from 'next/server';
import { DELIVERY_CONFIG } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Le panier est vide' },
        { status: 400 }
      );
    }

    if (!body.deliveryType) {
      return NextResponse.json(
        { error: 'Type de livraison requis' },
        { status: 400 }
      );
    }

    if (body.deliveryType === 'delivery') {
      if (!body.address || !body.address.quartier || !body.address.avenue) {
        return NextResponse.json(
          { error: 'Adresse de livraison incomplète' },
          { status: 400 }
        );
      }
    }

    if (!body.contact || !body.contact.fullName || !body.contact.phone) {
      return NextResponse.json(
        { error: 'Informations de contact requises' },
        { status: 400 }
      );
    }

    if (!body.paymentMethod) {
      return NextResponse.json(
        { error: 'Mode de paiement requis' },
        { status: 400 }
      );
    }

    // Generate order number
    const timestamp = Date.now();
    const orderNumber = `PK${timestamp.toString().slice(-8)}`;

    // Calculate pricing
    const subtotal = body.items.reduce(
      (sum: number, item: any) => sum + item.unitPrice * item.quantity,
      0
    );

    const deliveryFee =
      body.deliveryType === 'delivery' && subtotal < DELIVERY_CONFIG.FREE_THRESHOLD
        ? DELIVERY_CONFIG.FEE
        : 0;

    const total = subtotal + deliveryFee;

    // Create order object
    const order = {
      id: `order_${timestamp}`,
      orderNumber,
      items: body.items,
      deliveryType: body.deliveryType,
      address: body.address,
      contact: body.contact,
      paymentMethod: body.paymentMethod,
      pricing: {
        subtotal,
        deliveryFee,
        total,
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // TODO: Save to Firebase/Database
    // await orderService.createOrder(order);

    // TODO: Send confirmation email/SMS
    // await notificationService.sendOrderConfirmation(order);

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.pricing.total,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // TODO: Get orders for user
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
