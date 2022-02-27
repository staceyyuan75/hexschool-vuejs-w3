import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.min.js";

let productModal = null;
let delProductModal = null;

createApp({
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2",
      apiPath: "staceyyuan-hexschool",
      products: [],
      temp: {},
      isValid: {
        title: true,
        category: true,
        unit: true,
        origin_price: true,
        price: true
      },
      isNew: false,
      isConfirm: false
    };
  },
  methods: {
    checkAdmin() {
      // 取得 Token
      const token = this.getToken();

      // token 寫入 header
      axios.defaults.headers.common["Authorization"] = token;

      // 確認是否登入
      axios
        .post(`${this.apiUrl}/api/user/check`)
        .then(res => {
          this.getProducts();
        })
        .catch(error => {
          let isSuccess = error.data.success;
          let message = error.data.message;
          if (!isSuccess) {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: "btn btn-success"
              },
              buttonsStyling: false
            });
            swalWithBootstrapButtons
              .fire({
                title: "發生錯誤",
                text: message,
                icon: "warning",
                confirmButtonText: "登入",
                reverseButtons: true
              })
              .then(result => {
                if (result.isConfirmed) {
                  window.location.href = "./login.html";
                }
              });
          }
        });
    },
    getToken() {
      const token = document.cookie.replace(
        /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
      );
      return token;
    },
    getProducts() {
      // 取得後台產品列表
      axios
        .get(`${this.apiUrl}/api/${this.apiPath}/admin/products`)
        .then(res => {
          this.products = res.data.products;
        })
        .catch(error => {
          console.log(error.data);
        });
    },
    openModal(method, item) {
      if (method === "new") {
        this.temp = {
          imagesUrl: []
        };
        this.isNew = true;
        productModal.show();
      } else if (method === "edit") {
        this.temp = { ...item };
        this.isNew = false;
        productModal.show();
      } else if (method === "delete") {
        this.temp = { ...item };
        delProductModal.show();
      }
    },
    showSuccessAlert() {
      Swal.fire({
        title: "更新完成",
        icon: "success",
        confirmButtonColor: "#0d6efd",
        confirmButtonText: "確定"
      });
    },
    updateProduct() {
      // 先確認必要欄位是否有資料
      let invalidCount = this.beforeSubmit();

      if (invalidCount == 0) {
        // 新增產品 API
        let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
        let http = "post";

        if (!this.isNew) {
          // 編輯產品 API
          url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.temp.id}`;
          http = "put";
        }

        axios[http](url, { data: this.temp })
          .then(res => {
            this.isConfirm = false;
            productModal.hide();
            this.showSuccessAlert();
            this.getProducts();
          })
          .catch(error => {
            console.log(error.data);
          });
      }
    },
    delProduct() {
      // 刪除產品
      axios
        .delete(
          `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.temp.id}`,
          {
            id: this.temp.id
          }
        )
        .then(res => {
          delProductModal.hide();
          this.getProducts();
        })
        .catch(error => {
          console.log(error.data);
        });
    },
    createImages() {
      this.temp.imagesUrl = [];
      this.temp.imagesUrl.push("");
    },
    delImages(index) {
      // 刪除圖片
      this.temp.imagesUrl.splice(index, 1);
    },
    beforeSubmit() {
      let tempIsValid = {};
      let validateInput = Object.keys(this.isValid);
      let invalidCount = 0;

      validateInput.forEach(function (index) {
        let inputValue = document.getElementById(index).value.trim();
        if (inputValue == "" || inputValue === undefined) {
          tempIsValid[index] = false;
          invalidCount++;
        } else {
          tempIsValid[index] = true;
        }
      });

      this.isValid = tempIsValid;
      if (invalidCount > 0) {
        this.isConfirm = false;
      } else {
        this.isConfirm = true;
      }

      return invalidCount;
    },
    resetStatus(data) {
      this.isValid = data.isValid;
    }
  },
  mounted() {
    // 先確認登入狀態
    this.checkAdmin();

    productModal = new bootstrap.Modal(
      document.getElementById("productModal"),
      {
        keyboard: false
      }
    );

    delProductModal = new bootstrap.Modal(
      document.getElementById("delProductModal"),
      {
        keyboard: false
      }
    );

    // 若是關閉視窗則回復設定
    let vm = this;
    let myModalEl = document.getElementById("productModal");
    myModalEl.addEventListener("hidden.bs.modal", function (event) {
      vm.resetStatus(vm.$options.data());
    });
  }
}).mount("#app");
