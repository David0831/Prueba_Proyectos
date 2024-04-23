import { createStore } from "vuex";

export default createStore({
  state: {
    nameErrorMessage: "Por favor introduce un nombre",
    descriptionErrorMessage: "Por favor introduce una descripción",
    proyects: {
      name: "",
      description: "",
      status: "",
    },
    tasks: [],
    proyectData: {
      proyectName: "",
      proyectDescription: "",
      proyectStatus: "",
      proyectTasks: [],
    },
    // activarModal: false,
  },
  mutations: {
    // actualizarActivarModal(state, activo) {
    //   state.activarModal = activo;
    // },
    updateTasks(state, task) {
      state.tasks = task;
    },
    updateProyects(state, proyect) {
      state.proyects = proyect;
    },
    updateProyectData(state, data) {
      state.proyectData = data;
    },
  },
  actions: {
    // actualizarActivarModal({ commit }, activo) {
    //   commit("actualizarActivarModal", activo);
    // },
  },
  getters: {
    obtenerNameErrorMessage: (state) => {
      return state.nameErrorMessage;
    },
    obtenerDescriptionErrorMessage: (state) => {
      return state.descriptionErrorMessage;
    },
    obtenerTasks: (state) => {
      return state.tasks;
    },
    obtenerProyects: (state) => {
      return state.proyects;
    },
    obtenerProyectData: (state) => {
      return state.proyectData;
    },
    // obtenerActivarModal: (state) => {
    //   return state.activarModal;
    // },
  },
});
