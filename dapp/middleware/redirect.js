import tpInfo from "@/js/tp";

export default async function({ route, redirect }) {
  if (route.path === "/") {
    const currentWallet = await tpInfo.getAddress();
    if (!currentWallet) {
      return;
    }
  }
}