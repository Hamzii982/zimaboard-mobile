import AsyncStorage from "@react-native-async-storage/async-storage";
import Pusher from "pusher-js/react-native";

let pusher: Pusher | null = null;

export const initPusher = async (userId: number, onMessage: (data: any) => void) => {
    if (pusher) return; // already initialized

    const token = await AsyncStorage.getItem("token");

    pusher = new Pusher("2faa6528d6871c8c8a49", {
        cluster: "eu",
        authEndpoint: "http://localhost:8080/api/broadcasting/auth",
        auth: {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        },
    });

    const channel = pusher.subscribe(`private-user.${userId}`);

    channel.bind("message.created", (data: any) => {
        onMessage(data);
    });

    channel.bind("chat.created", (data: any) => {
        onMessage(data);
    });

};
