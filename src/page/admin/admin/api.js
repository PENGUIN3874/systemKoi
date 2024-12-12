import axios from "axios";
const accId = localStorage.getItem("userId");
const baseURL = `https://koicaresystemapi.azurewebsites.net/api/Note?accId=${accId}`;

export const getMessage = async () =>{
    try {
        const response = await axios.get(baseURL);
        return response. data;
    } catch (error) {
        console.log(error.toString());
    }
}