import { ChefProfile, Dish } from './types';

export const INITIAL_CHEF_PROFILE: ChefProfile = {
  store_name: "",
  name: "Rolando",
  title: "Executive Chef / Creative Director",
  bio: "致力於將傳統烹飪技藝與現代創新融合，透過每一道佳餚演繹感官故事。擁有超過十五年的頂級餐飲經驗，專注於食材本味的極致發揮。",
  image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3jaeKVcJimTXBq17P7X2VU4a4E5zx_Eu3KA6m1jGIIH6GsrOlI2UurzjYT5xLqk6ngEyigdo7sSFr_zAG5SCxNi0sf2mBOtewv4rRNPnHBwXXSlZryB3mj3tZSMl75oE0WY9ZMhjSSjSJdo9itFINrVR80SHQQP0gl86VYob0aNarvOIyvNjKtAx5_EibxzBe3sjkb6MuZei3lzPx8bb-4PbtIZQiYrwh4SkFiNukUY54Zg_DVV0ZWL-ns7St4SKjif2u4mAs4TII",
  socials: {
    instagram: "https://instagram.com/chef_julian",
    facebook: "",
    line: "",
    email: ""
  },
  cta_title: "預約私廚體驗",
  cta_description: "在您的私人寓所中，體驗由主廚親自操刀的 8 道式招牌饗宴。",
  order_link: "",
  show_order_button: false,
  show_cta: true,
  show_qa: false,
  show_reviews: true
};

export const INITIAL_DISHES: Dish[] = [
  {
    id: "1",
    name: "黑松露燉飯",
    price: 880,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHyatW_1UGr5z45eaZyMUfIs8d_E-NsOCKATQE5UbTd7uU-Fk_6w_TbH2ihEpggcKR-ADzCZe7BZ7loBkO7LIgZSYpdeCUWKl2SCm6QG6iMcqvidGfmk7gO1k_VydZ6Kkbbcy47Nhjl3IKtJv1u-k-BLbGSA4m7aEdQUE30if_mLq0lIZd7LjkRvHEsJdGRyWUr8lFstLja2YrlXOrt--wXg0b5u5bx3-jNO5WnE0efM90RUFynEq78lXj6zS1RAsJoHSRA0QxUHMl",
    description: "義大利進口黑松露搭配陳年帕馬森起司，濃郁香氣在口中綻放。",
    inspiration: "靈感來自義大利北部秋季的松露狩獵之旅，試圖重現森林清晨的氣息。",
    ingredients: ["義大利米", "黑松露", "帕馬森起司", "雞高湯"],
    available: true,
    is_visible: true
  },
  {
    id: "2",
    name: "嫩煎北海道干貝",
    price: 1200,
    originalPrice: 1500,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6jrYdWVftqU_c8xM-wBBPE9ota6XrJqYG7TZLsrVWgyc01vaKDIj1oTmni2DjUaBnGxKHBAFdk9OArEXYnXew9NS6qN5xyK0rykf1zCAo4Pi4PqwoT2aPw1StVKLT1Ni2mpSFBkbJ_80SXPI4dQHDfCnF59-nXRbQk-khgl6UMAjDA3aPrcdUbsHu2fVXnPU1FJet-TpiAxeTjjAU-fA-JJ6KMrghr7i8JPxD26wGtWD_d0lip_sx5C8bPHNEk0YyPCc_arc9gaKn",
    description: "北海道生食級干貝，經過高溫精準香煎至外層金黃酥脆，內部仍保有如絲綢般的鮮甜口感。",
    inspiration: "這道料理源於對海洋鮮味的致敬。搭配主廚特調的豌豆泥，將大地與海洋的奢華風味完美融合。",
    ingredients: ["北海道干貝", "青豆泥", "檸檬泡沫", "微型香草"],
    available: true,
    is_visible: true
  },
  {
    id: "3",
    name: "和牛薄片配魚子醬",
    price: 1580,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8o97nqtVT192_Oew8NfPRxMNRPQPJxRZQ_PHc0QtljG6vR7cfMlfvawuhuIf83B4sTlrnpeLvZ1V5IHbhuV8HyyqShSrLHDNitclNexRIXgmPdBvw8SPAlTywepNFHem897OWyAPKIIZ6ftYLHYrK9t8P2aQTfJoOusv4dkCgInkye37iNuiZtX4Bdx7LIG4ukBigeBzv_hU0qwcNrmj2kmvqQQ1gDDH4Jq63_G-z6Y6HK8ZO-AVJEbgnOV8PpkWI9PwKkPvGFqwP",
    description: "A5 和牛極薄切片，捲入頂級魚子醬，口感層次豐富。",
    inspiration: "極致奢華的前菜體驗，旨在喚醒味蕾。",
    ingredients: ["A5和牛", "魚子醬", "金箔", "特製醬汁"],
    available: true,
    soldOut: true,
    is_visible: true
  },
  {
    id: "4",
    name: "柚子清爽塔",
    price: 450,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAI9pPwjqVBeVthz6wBTx-q-CnN4cusJy4ZuJQW2J96OtFIpw49FSCp_Z0Ro4cBmwMjylHGc5DVTh6i8fmWTFrJ27PqXG83yutaNXkFGKLdPj0tDXlyBnqJNYD1AqkBxK5LNqFzc1uA_3qgkr1sC6sBzd0qZD7_uoSrqvhDjmM0i-cInPQZpwBnZZ_Y-XcBllG0-M4981bVd-vhjbt0kZz2rUvHwj2GMo2Wq8Mb0dV_E3LyIENrvqswVJX28kzc_ynUUQuJAXiTikTe",
    description: "手工塔皮搭配日本高知縣柚子卡士達，酸甜平衡。",
    inspiration: "清新解膩的完美句點。",
    ingredients: ["柚子原汁", "法國奶油", "杏仁粉", "蛋白霜"],
    available: true,
    is_visible: true
  },
  {
    id: "5",
    name: "法式野菇濃湯",
    price: 380,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNvpMPbrPvPOFfIlSkptscjN_Y5q8SytmGN31tB2vdpwOUu8HlNRflQ8NvbcK_JBxVUyjxj2aL9ruAseTPmJLtjA6ObXGVWw2siJpD-Q8j45ptcq2Wk2tNG9A0fk1nxhaN2FdI7PwEo5NQ_ofbyRrGVG6sv-qVyrB1GoYeDM9zTUyDSSb9_sMkogPPzhJ-wda_eJRKPJmLUKIV4_-KNZUgqo3PmWibjjIPuKhj0csLi3pLZetJfw_3u0mnZds9wnA896swye_b_zgo",
    description: "綜合野菇慢火熬製，加入松露油提香。",
    inspiration: "暖心暖胃的經典湯品。",
    ingredients: ["牛肝菌", "香菇", "鮮奶油", "松露油"],
    available: true,
    is_visible: true
  },
  {
    id: "6",
    name: "香煎大西洋海鱸魚",
    price: 920,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBslpYgBPRzOGYGjJvfPz30jZ8bUG7sPtyfrcySQ4uE-0hf8PKi7t3mg7pI1c_Cg2usUkuXjFffVjZcDYZP0VEYX5gikbBH42nb_zTxgjxqX0Tj82qFrwAsuqw5y1BzHQ3HbRnID3UjEGhaA31qZgNYmq2pj55d_Ps_TZ2FiI7dKfZOzI0eu4KfUKzWBNUyPytv0uIM0qmRPIujVYDZR62jkak55FsUZgB60_bLIIVt2yDx2qyGL_-0CqhMElbQ_u7E6dVNHwxk8x3K",
    description: "海鱸魚菲力，搭配時令蔬菜與白酒奶油醬。",
    inspiration: "傳統法式魚料理的現代演繹。",
    ingredients: ["海鱸魚", "蘆筍", "白酒", "奶油"],
    available: true,
    is_visible: true
  },
  {
    id: "7",
    name: "經典龍蝦皇",
    price: 2100,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDl1J-X8aTjd9VBy1MkO1Chly2GJ5DVscPQHYcxE4ANgEOK9hoCxpjFsIFhhfB1KEuFblcpw_urJ90ZMm2C4Fu844ON-0KHKlAdeDupFMwl696BQmM5T0Di0XTj_1EdRLHyuSh21HX7eE8CB4DaL7dbMEb1reSxeAteSKNTJ1SfnuLn-Y8FhSJo6Bcc0Lnmwd137SgBuxfjKmHn2kxiqoskZj2Ek0i7V5J4vWwIsBy39LU3YSmRC9e87Kt-SjyTftLwyI9HPhS5H0WU",
    description: "整隻波士頓龍蝦，焗烤至金黃，鮮甜彈牙。",
    inspiration: "慶祝時刻的必備佳餚。",
    ingredients: ["波士頓龍蝦", "起司", "白醬", "香草"],
    available: true,
    is_visible: true
  },
  {
    id: "8",
    name: "岩漿巧克力蛋糕",
    price: 420,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBupiITbV2AMaY-4Uuve5HZjGYdUcD_JwMIRUeTfrhDUtjIe2M0m6Gr0O9Xtj1-uLqTHl98vu0l6lupfZ1LKmyb-9zyT3l5hg7lvRElOpZxcNrO7r2qHFpvvlxtcyiFEKn6-ZxoVYhsgpDk3JNpEayQ3PxtaG7zXjy_G4zlo2YxxuGywpBSKqSWlREb22oDMW7RwSHxMlHrMAOkTNTzXFv2sE6N5ivoGGrLPZLrOXNaAecLViCo0sKRjuFA-mZBpzCh-Bqbonmup4rJ",
    description: "70% 苦甜巧克力製作，切開後流出濃郁巧克力漿。",
    inspiration: "甜點主廚的招牌之作。",
    ingredients: ["苦甜巧克力", "奶油", "雞蛋", "麵粉"],
    available: true,
    is_visible: true
  }
];
