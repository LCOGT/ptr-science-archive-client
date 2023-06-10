<template>
  <div>
    <b-alert v-for="errorMessage in errorMessages" :key="errorMessage" variant="danger" show>
      {{ errorMessage }}
    </b-alert>
    <b-form @submit="login">
      <b-form-input v-model="credentials.username" placeholder="Username" class="my-1" required></b-form-input>
      <b-form-input v-model="credentials.password" placeholder="Password" type="password" class="my-1"></b-form-input>
      <b-button type="submit" variant="primary" class="my-1">Login</b-button>
    </b-form>
  </div>
</template>
<script>
export default {
  name: 'Login',
  data: function() {
    return {
      errorMessages: [],
      credentials: {
        username: '',
        password: ''
      }
    };
  },
  methods: {
    parseErrorMessages: function(responseJson) {
      let errorMessages = [];
      for (let field in responseJson) {
        if (field === 'non_field_errors') {
          errorMessages.push(...responseJson[field]);
        } else {
          for (let message of responseJson[field]) {
            errorMessages.push(field + ': ' + message);
          }
        }
      }
      return errorMessages;
    },
    login: function(evt) {
      evt.preventDefault();
      this.errorMessages = [];
      this.$store
        .dispatch('getArchiveToken', this.credentials)
        .then(() => {
          let successPathname = this.$router.resolve({ name: 'Home' });
          window.location = successPathname.href;
        })
        .catch(response => {
          if (response.status >= 400 && response.status < 500) {
            this.errorMessages = this.parseErrorMessages(response.responseJSON);
          } else {
            this.errorMessages = ['Oops, there was an unexpected error logging in. Please try again, and if the problem persists, contact support.'];
          }
        });
    }
  }
};
</script>
