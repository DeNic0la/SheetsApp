import {DateEntryInfo, MeetingInfo, NoonInfo} from "./specific-types";
import {MyLogger} from "./Logger";


export type PlaceInfo = {
    short:string;
    full:string;
}
export const getPlace = (data:DateEntryInfo):PlaceInfo => {
    const place = data.place.trim();
    if (isMK(place)){
        if (data.startDate.getMinutes() !== 30){
            MyLogger.info(`Der Nachmittag vom ${data.date.toLocaleString()} beginnt nicht um 11:30, ist aber in der MK`)
        }
        return {short: 'MK',full:'Markuskirche Luzern'}
    }
    if (isGutsch(place)){
        if (data.startDate.getMinutes() !== 15){
            MyLogger.info(`Der Nachmittag vom ${data.date.toLocaleString()} beginnt nicht um 12:15, ist aber im Gütsch`)
        }
        return {short: 'Gütsch',full:'Gütschwald Luzern'}
    }
    if (isSeki(place)) return {short: 'Markuskirche Luzern',full:'Sekretariat Markuskirche Luzern'}
    return {
        short: place,
        full: place
    }
}

const isMK = (str:string):boolean => {
    const place = str.toUpperCase().replace(/ /g,'');
    return (place === "MK" || place === "MARKUSKURCHE"||place === "MARKUSKIRCHELUZERN")
}
const isSeki = (str:string):boolean => {
    const place = str.toUpperCase().replace(/ /g,'');
    return (place === "SEKRRETARIAT" || place === "SEKRETARIATMARKUSKIRCHE" || place === "SEKI" || place === "SEKRETARIAT"||place === "SEKRETARIATMARKUSKIRCHELUZERN");
}
const isGutsch = (str:string):boolean => {
    const place = str.toUpperCase().replace(/U/g,'').replace(/E/g,'').replace(/Ü/g,'');
    return (place === "GTSCH" || place === "GTSH" || place === "GTSC")
}