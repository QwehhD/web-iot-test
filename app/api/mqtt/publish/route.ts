import { NextResponse } from "next/server";
import mqtt from "mqtt";

export async function POST(req: Request) {
  try {
    const { topic, message } = await req.json();

    const client = await mqtt.connectAsync(process.env.NEXT_PUBLIC_MQTT_URL!, {
      username: process.env.NEXT_PUBLIC_MQTT_USER,
      password: process.env.MQTT_PASS,
    });

    await client.publish(topic, JSON.stringify(message));
    await client.end();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}