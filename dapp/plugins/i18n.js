import Vue from "vue";
import VueI18n from "vue-i18n";
Vue.use(VueI18n);

export default ({ app }) => {
  app.i18n = new VueI18n({
    locale: "zh_CN",
    fallbackLocale: "zh_CN",
    messages: {
      zh_CN: require("~/locales/zh-CN")
    }
  });
};
