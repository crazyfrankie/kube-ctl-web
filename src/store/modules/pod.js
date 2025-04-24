import { getPodList } from "@/api/pod";

const state = {}

const mutations = {}

const actions = {
    getPodList({ commit, state }) {
      return new Promise((resolve, reject) => {
        getPodList().then(response => {
          resolve(response)
        }).catch(error => {
            reject(error);
        });
    })
  },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}