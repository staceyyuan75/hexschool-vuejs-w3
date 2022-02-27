import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.min.js";

createApp({
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2"
    };
  },
  methods: {
    login() {
      const url = `${this.apiUrl}/admin/signin`;
      const username = document.querySelector("#username").value;
      const password = document.querySelector("#password").value;
      const user = {
        username,
        password
      };
      axios
        .post(url, user)
        .then(res => {
          const { token, expired } = res.data;
          document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
          window.location.href = "./index.html";
        })
        .catch(error => {
          let isSuccess = error.data.success;
          let message = error.data.message;
          if (!isSuccess) {
            Swal.fire({
              icon: "error",
              title: message,
              text: "請重新登入"
            });
          }
        });
    }
  }
}).mount("#app");
