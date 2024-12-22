import { NextResponse } from "next/server";
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

import type { Contract } from "@/types";
import { pusherServer } from "@/lib/pusher";
import { contractSchema, type ContractUpdate } from "@/types";

const dataFilePath = path.join(process.cwd(), "/data/contracts.json");

async function getContractsData() {
  const data = await fs.readFile(dataFilePath, "utf-8");
  return JSON.parse(data);
}

async function saveContractsData(contracts: Contract[]) {
  await fs.writeFile(dataFilePath, JSON.stringify(contracts, null, 2));
}

async function notifyClients(update: ContractUpdate, socketId?: string) {
  try {
    await pusherServer.trigger("contracts", "contract.update", update, {
      socket_id: socketId,
    });
  } catch (error) {
    console.error("Pusher notification error:", error);
  }
}

export async function GET() {
  try {
    const contracts = await getContractsData();
    return NextResponse.json(contracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { contract, socketId } = await request.json();
    const validatedData = {
      ...contract,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const contracts = await getContractsData();
    contracts.unshift(validatedData); 
    await saveContractsData(contracts);

    // Notify clients about the new contract
    await notifyClients(
      {
        type: "contract.created",
        data: validatedData,
      },
      socketId
    );

    return NextResponse.json(validatedData, { status: 201 });
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Invalid contract data" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { contract, socketId } = await request.json();
    const validatedData = contractSchema.parse(contract);

    const contracts = await getContractsData();
    const index = contracts.findIndex(
      (c: Contract) => c.id === validatedData.id
    );

    if (index === -1) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const updatedContract = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    contracts[index] = updatedContract;
    await saveContractsData(contracts);

    // Notify clients about the updated contract
    await notifyClients(
      {
        type: "contract.updated",
        data: updatedContract,
      },
      socketId
    );

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error("Error updating contract:", error);
    return NextResponse.json(
      { error: "Invalid contract data" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, socketId } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Contract ID is required" },
        { status: 400 }
      );
    }

    const contracts = await getContractsData();
    const index = contracts.findIndex((c: Contract) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const deletedContract = contracts[index];
    contracts.splice(index, 1);
    await saveContractsData(contracts);

    // Notify clients about the deleted contract
    await notifyClients(
      {
        type: "contract.deleted",
        data: deletedContract,
      },
      socketId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contract:", error);
    return NextResponse.json(
      { error: "Failed to delete contract" },
      { status: 500 }
    );
  }
}
