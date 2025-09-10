import axios from 'axios';
import rankedLogo from '../../assets/Competitive.png';
const api = axios.create({
  baseURL: 'https://valorant-api.com/v1',
  timeout: 10000,
});

// App Lang.
let currentLanguage: string = 'tr-TR';

// 
export const setApiLanguage = (lang: string) => {
  currentLanguage = lang;
};

// Get Current Lang.
export const getApiLanguage = () => currentLanguage;

/* =========================
 *   Types
 * ========================= */
export type Agent = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  fullPortrait?: string | null;
  role?: { displayName: string } | null;
};

export type MapItem = {
  uuid: string;
  displayName: string;
  splash?: string | null;
  listViewIcon?: string | null;
};

export type Weapon = {
  uuid: string;
  displayName: string;
  displayIcon?: string | null;
  category?: string | null;
  shopData?: {
    cost?: number | null;
    categoryText?: string | null;
  } | null;
  skins?: Array<{
    uuid: string;
    displayName: string;
    displayIcon?: string | null;
    wallpaper?: string | null;
    chromas?: Array<{
      uuid: string;
      displayName: string;
      fullRender?: string | null;
    }>;
    levels?: Array<{
      uuid: string;
      displayName: string;
      displayIcon?: string | null;
      streamedVideo?: string | null;
    }>;
  }>;
};

/* =========================
 *   AGENTS
 * ========================= */

// Agent func 
export const getAgents = async (): Promise<Agent[]> => {
  try {
    const response = await api.get('/agents', {
      params: {
        isPlayableCharacter: true,
        language: currentLanguage, 
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Ajanlar alınırken hata oluştu:', error);
    throw error;
  }
};

// Tek ajan detayını id ile çek
export const getAgentById = async (id: string): Promise<Agent> => {
  try {
    const response = await api.get(`/agents/${id}`, {
      params: { language: currentLanguage }, 
    });
    return response.data.data;
  } catch (error) {
    console.error('Ajan detayı alınırken hata oluştu:', error);
    throw error;
  }
};

/* =========================
 *   MAPS
 * ========================= */

export const getMaps = async (): Promise<MapItem[]> => {
  try {
    const response = await api.get('/maps', {
      params: { language: currentLanguage }, 
    });
    return response.data.data;
  } catch (error) {
    console.error('Mapler alınırken hata oluştu:', error);
    throw error;
  }
};

/* =========================
 *   WEAPONS 
 * ========================= */

// Weapon List
export const getWeapons = async (): Promise<Weapon[]> => {
  try {
    const response = await api.get('/weapons', {
      params: { language: currentLanguage },
    });
    const data: Weapon[] = response.data?.data ?? [];

   

    // Sort by alphabetic (TR)
    return data.sort((a, b) =>
      (a.displayName || '').localeCompare(b.displayName || '', 'tr')
    );
  } catch (error) {
    console.error('Silahlar alınırken hata oluştu:', error);
    throw error;
  }
};

// Weapon Skin (skins, chromas, levels)
export const getWeaponById = async (id: string): Promise<Weapon> => {
  try {
    const response = await api.get(`/weapons/${id}`, {
      params: { language: currentLanguage },
    });
    return response.data?.data;
  } catch (error) {
    console.error('Silah detayı alınırken hata oluştu:', error);
    throw error;
  }
};


// GAME MODES // 

export const getGameModes = async () => {
  try {
    const response = await api.get('/gamemodes', {
      params: { language: currentLanguage },
    });
    let modes = response.data.data;

    const modeTranslations: Record<string, string> = {
      'Competitive' : 'REKABETÇİ',
      'Premier' : 'PREMIER',
      'Custom': 'ÖZEL OYUN',
      'STANDART': 'DERECESİZ'
    };


    // Unwanted mods
    modes = modes.filter(
      (mode: any) =>
        mode.displayName !== 'TEMEL EĞİTİM' &&
        mode.displayName !== 'KOPYA' &&
        mode.displayName !== 'POLİGON' &&
        mode.displayName !== 'KARTOPU ÇATIŞMASI' &&
        mode.displayName !== 'ALIŞMA AŞAMASI' &&
        mode.displayName !== 'BOT KARŞILAŞMASI'
    );

    // Manually added modes
        const extraModes = [
      {
        uuid: 'custom-competitive',
        displayName: 'Competitive',
        displayIcon: rankedLogo,
        description:"Rekabetçi modu, derecesiz ile aynı kuralları içeren bir oyun modudur. Oyunda toplamda 9 adet seviye bulunmaktadır. Demir -> Bronz -> Gümüş -> Platinum -> Elmas -> Yücelik -> Ölümsüzlük -> Radiant sıralamasıyla ilerler. Yerleştirme maçlarınız sonrasında bir kümeye yerleştirilirsiniz. Maçları kazanma ya da kaybetme durumunuza göre olduğunuz kümeden üst kümeye çıkabilir ya da düşebilirsiniz.",
      },
      {
        uuid:'custom-premier',
        displayName:'Premier',
        displayIcon:'https://static.wikia.nocookie.net/valorant/images/9/9d/Premier.png/',
        description:"Premier, VALORANT'ın en yeni rekabetçi turnuva oyun modudur - oyun ve spor arasında bir köprü ve 2020-2023 VCT devresinin Challengers Ligleri için kullanılan açık eleme sisteminin yerine geçer. Oyun içi amatör bir lige benzeyen Premier modu, sıradan oyunculara profesyonel olmanın tadına varmalarını sağlayan çetin bir takım turnuvasıdır - bir espor kariyerini ciddi olarak düşünen herkes için mutlak bir zorunluluktur."
      },
      {
        uuid:'custom-custom',
        displayName:'Custom',
        displayIcon:'https://media.valorant-api.com/gamemodes/96bd3920-4f36-d026-2b28-c683eb0bcac5/displayicon.png',
        description:"Tek başınıza ya da arkadaşlarınızla beraber girip, herhangi bir haritada birbirinizle istediğiniz modda oynayabileceğiniz ya da harita/ajan bilginizi geliştirmek için vakit geçirebilirsiniz. ",
      },
    ];

    // From API + added manually
    modes = [...modes, ...extraModes];
    modes = modes.map((mode: any) => ({
      ...mode,
      displayName: modeTranslations[mode.displayName] || mode.displayName,
    }));
    // Custom Sorting List 
    const customOrder = [
       
      'DERECESİZ',
      'REKABETÇİ',
      'ÖLÜM KALIM SAVAŞI',
      'TAM GAZ',
      "SPIKE'A HÜCUM",
      'TIRMANIŞ',
      'TAKIMLI ÖLÜM KALIM SAVAŞI',
      'PREMIER',
      'CUSTOM',
    ];


    // Sorting
    modes.sort((a: any, b: any) => {
      const indexA = customOrder.indexOf(a.displayName);
      const indexB = customOrder.indexOf(b.displayName);

      if (indexA === -1 && indexB === -1) return a.displayName.localeCompare(b.displayName);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    return modes;
  } catch (error) {
    console.error('Oyun modları alınırken hata:', error);
    throw error;
  }
};
  

export default api;
