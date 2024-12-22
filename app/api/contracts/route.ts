import { NextResponse } from "next/server";
import crypto from "crypto";
import { pusherServer } from "@/lib/pusher";
import { contractSchema, type ContractUpdate } from "@/types";
import { getContracts, createContract, updateContract, deleteContract } from "@/lib/db";

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
    const contracts = await getContracts();
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
    
    // Ensure value is a number
    const validatedData = {
      ...contract,
      id: crypto.randomUUID(),
      value: Number(contract.value),
      createdAt: new Date().toISOString(),
    };

    const parsedContract = contractSchema.parse(validatedData);
    const newContract = await createContract(parsedContract);

    await notifyClients(
      {
        type: "contract.created",
        data: newContract,
      },
      socketId
    );

    return NextResponse.json(newContract, { status: 201 });
  } catch (error) {
    console.error("Error creating contract:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { contract, socketId } = await request.json();
    const { id } = contract;
    if (!id) {
      return NextResponse.json(
        { error: "Contract ID is required" },
        { status: 400 }
      );
    }

    // Validate the contract data
    const validatedData = contractSchema.parse({
      ...contract,
      value: Number(contract.value),
      updatedAt: new Date().toISOString(),
    });

    const updatedContract = await updateContract(id, validatedData);

    if (!updatedContract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

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
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
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

    const deletedContract = await deleteContract(id);
    if (!deletedContract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    await notifyClients(
      {
        type: "contract.deleted",
        data: deletedContract,
      },
      socketId
    );

    return NextResponse.json(deletedContract);
  } catch (error) {
    console.error("Error deleting contract:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete contract" },
      { status: 500 }
    );
  }
}
