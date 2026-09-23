"use client";

import { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { request } from "@stacks/connect";
import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  stringAsciiCV,
  uintCV,
} from "@stacks/transactions";
import { addressAtom } from "../store/wallet";

const CONTRACT_ADDRESS = "ST1RDEMSE8XWD013B34N22PWQPVYTESFP9H0RB2G6";
const CONTRACT_NAME = "guestbook";
const CONTRACT_ID = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

type Msg = { id: number; author: string; message: string; timestamp: number };

export default function GuestbookPage() {
  const address = useAtomValue(addressAtom);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);

  // --- reads ---
  const fetchCount = async () => {
    try {
      const result = await fetchCallReadOnlyFunction({
        network: "testnet",
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-message-count",
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
      });
      const total = Number(cvToJSON(result).value);
      setCount(total);
      return total;
    } catch (err) {
      console.error("count error", err);
      return 0;
    }
  };

  const fetchMessage = async (id: number): Promise<Msg | null> => {
    try {
      const result = await fetchCallReadOnlyFunction({
        network: "testnet",
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-message",
        functionArgs: [uintCV(id)],
        senderAddress: CONTRACT_ADDRESS,
      });
      const json = cvToJSON(result);
      if (!json.value) return null;
      const v = json.value.value ?? json.value;
      return {
        id,
        author: v.author.value,
        message: v.message.value,
        timestamp: Number(v.timestamp.value),
      };
    } catch (err) {
      console.error(`msg ${id} error`, err);
      return null;
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    const total = await fetchCount();
    const list: Msg[] = [];
    for (let i = 0; i < total; i++) {
      const m = await fetchMessage(i);
      if (m) list.push(m);
    }
    setMessages(list.reverse());
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // --- write ---
  const writeMessage = async () => {
    if (!message.trim()) return;
    if (!address) {
      alert("Connect your wallet first.");
      return;
    }
    try {
      const result: any = await request("stx_callContract", {
        contract: CONTRACT_ID as `${string}.${string}`,
        functionName: "write-message",
        functionArgs: [stringAsciiCV(message)],
        network: "testnet",
      });
      setTxId(result?.txid ?? result?.txId ?? null);
      setMessage("");
      setTimeout(loadMessages, 8000);
    } catch (err) {
      console.error("write error", err);
    }
  };

  // --- UI ---
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">📖 Stacks Guestbook</h1>

        <div className="bg-gray-900 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">Leave a message</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="Write something onchain..."
            className="w-full p-3 bg-gray-800 rounded border border-gray-700"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{message.length}/200</span>
            <button
              onClick={writeMessage}
              disabled={!address || !message.trim()}
              className="px-6 py-2 bg-orange-600 rounded font-semibold disabled:bg-gray-700"
            >
              Write onchain
            </button>
          </div>
          {txId && (
            <p className="text-xs text-green-400 break-all">
              Tx:{" "}
              <a
                href={`https://explorer.hiro.so/txid/${txId}?chain=testnet`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {txId}
              </a>
            </p>
          )}
        </div>

        <div className="bg-gray-900 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Messages ({count})</h2>
            <button
              onClick={loadMessages}
              disabled={loading}
              className="text-sm px-3 py-1 bg-gray-800 rounded"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {messages.length === 0 && !loading && (
            <p className="text-gray-500 text-sm">No messages yet.</p>
          )}

          <ul className="space-y-3">
            {messages.map((m) => (
              <li key={m.id} className="bg-gray-800 p-4 rounded">
                <p className="text-sm">{m.message}</p>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>
                    {m.author.slice(0, 6)}...{m.author.slice(-4)}
                  </span>
                  <span>Block #{m.timestamp}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}