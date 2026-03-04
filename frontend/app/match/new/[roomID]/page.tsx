'use client'
import Blackboard from "@/components/blackboard";
import WhiteBoard from "@/components/whiteBoard";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Match(){

    const gamedetails = JSON.parse(localStorage.getItem('gameInit') || "{}");
    const color = gamedetails.color;

    const [username, setUsername] = useState("");

    async function getusername() {
        try {
            const base =
                process.env.NEXT_PUBLIC_API_URL ||
                `http://${process.env.NEXT_PUBLIC_IP_ADDRESS}` ||
                "";

            const res = await axios.get(`${base}/getuser`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setUsername(res.data.name);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getusername();
    }, []);

    // choose board dynamically
    const Board = color === "white" ? WhiteBoard : Blackboard;

    return (
        <div>
            {username}
            <Board />
        </div>
    );
}