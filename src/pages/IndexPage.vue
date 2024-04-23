<template>
  <q-page class="flex flex-center">
    <div class="text-center q-mt-xl text-grey-10 text-h2">Mis Proyectos</div>

    <div class="q-mt-xl items-center" style="width: 100%" align="center">
      <div class="absolute-top-right q-ma-md">
        <q-btn-dropdown
          color="grey-10"
          class="text-brown-1"
          rounded
          label="Filtrar"
        >
          <q-list
            bordered
            padding
            class="rounded-borders bg-grey-10 text-brown-1"
          >
            <q-item
              clickable
              v-close-popup
              v-ripple
              :active="filterLink === 'all'"
              active-class="my-menu-link"
              @click="filterProjects('all'), (filterLink = 'all')"
            >
              <q-item-section>
                <q-item-label>Mostrar Todos</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              v-ripple
              :active="filterLink === 'active'"
              active-class="my-menu-link"
              @click="filterProjects('active'), (filterLink = 'active')"
            >
              <q-item-section>
                <q-item-label>Mostrar Activos</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              v-ripple
              :active="filterLink === 'inactive'"
              active-class="my-menu-link"
              @click="filterProjects('inactive'), (filterLink = 'inactive')"
            >
              <q-item-section>
                <q-item-label>Mostrar Inactivos</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <div v-if="paginatedProjects.length === 0" class="text-center">
        <div class="text-h4 text-red-10">No se encontraron proyectos.</div>
      </div>

      <div
        v-for="(proyect, proyectIndex) in filteredActiveProjects"
        :key="proyectIndex"
      >
        <q-card
          class="my-card q-my-xl bg-brown-1"
          style="max-width: 700px; height: 500px"
        >
          <q-card-section class="bg-grey-10 text-brown-1 text-left">
            <div class="text-h4">{{ proyect.proyectName }}</div>

            <div
              class="text-body1 text-justify scroll"
              style="max-height: 130px"
            >
              {{ proyect.proyectStatus }}
            </div>
          </q-card-section>

          <q-card-section class="text-center text-h6 text-grey-10 bg-brown-1">
            <div
              class="row"
              v-for="(task, TaskIndex) in proyect.proyectTasks"
              :key="TaskIndex"
            >
              <q-item
                clickable
                v-ripple
                @click="
                  (taskModal = true),
                    (dataTaskName = task.name),
                    (dataTaskDescription = task.description),
                    (dataTaskStatus = task.status),
                    (dataTaskIndex = TaskIndex),
                    (dataProyectIndex = proyectIndex)
                "
              >
                <q-item-section>
                  {{ task.name }} - {{ task.status }}
                </q-item-section>
              </q-item>
            </div>
          </q-card-section>

          <q-card-actions
            align="around"
            class="q-ma-none absolute-bottom bg-brown-1"
          >
            <q-btn
              flat
              :ripple="{ center: true }"
              style="width: 100%; height: 50px"
              @click="
                (proyectDetailsModal = true),
                  (dataProyectName = proyect.proyectName),
                  (dataProyectDescription = proyect.proyectDescription),
                  (dataProyectStatus = proyect.proyectStatus),
                  (dataProyectIndex = proyectIndex),
                  getStatusCount(proyect.proyectTasks)
              "
              ><div class="text-h6 text-grey-10">Detalles</div></q-btn
            >
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Modal para crear proyecto -->
    <div>
      <q-dialog
        persistent
        v-model="statusModal"
        style="width: 500px"
        transition-show="rotate"
        transition-hide="scale"
        ref="proyectModal"
      >
        <q-card style="width: 50%" class="text-center bg-brown-1 text-grey-10">
          <q-card-section class="bg-grey-10 text-brown-1">
            <div class="text-h6">Nuevo Proyecto</div>
          </q-card-section>

          <q-separator inset />
          <q-card-section
            style="max-height: 700px"
            class="scroll"
            align="center"
          >
            <div class="q-pa-md" style="max-width: 400px">
              <q-form ref="proyect" @submit="submitForm" class="q-gutter-md">
                <q-input
                  filled
                  v-model="formData.proyectName"
                  label="Nombre del proyecto *"
                  lazy-rules
                  color="grey-10"
                  :rules="[
                    (val) =>
                      (val && val.length > 0) ||
                      'Por favor introduce un nombre',
                  ]"
                />

                <q-input
                  filled
                  type="textarea"
                  v-model="formData.proyectDescription"
                  label="Descripción del proyecto *"
                  lazy-rules
                  color="grey-10"
                  :rules="[
                    (val) =>
                      (val && val.length > 0) ||
                      $store.getters.obtenerDescriptionErrorMessage,
                  ]"
                />

                <div>
                  <q-toggle
                    v-model="checkTask"
                    checked-icon="check"
                    color="grey-10"
                    unchecked-icon="clear"
                    label="¿Deseas crear tareas?"
                  />
                </div>

                <div v-if="checkTask">
                  <div class="text-h6 q-mb-md">Crear nueva tarea</div>

                  <q-separator inset />

                  <q-form
                    ref="tasks"
                    @submit="createTask"
                    class="q-gutter-md q-mt-md"
                  >
                    <q-input
                      filled
                      v-model="formData.taskName"
                      label="Nombre de la tarea *"
                      lazy-rules
                      color="grey-10"
                      :rules="[
                        (val) =>
                          (val && val.length > 0) ||
                          !checkTask ||
                          $store.getters.obtenerNameErrorMessage,
                      ]"
                    />

                    <q-input
                      filled
                      type="textarea"
                      v-model="formData.taskDescription"
                      label="Descripción de la tarea *"
                      lazy-rules
                      color="grey-10"
                      :rules="[
                        (val) =>
                          (val && val.length > 0) ||
                          !checkTask ||
                          $store.getters.obtenerDescriptionErrorMessage,
                      ]"
                    />

                    <div class="text-subtitle2">Estado de la tarea</div>

                    <div class="q-gutter-sm">
                      <q-radio
                        v-model="taskStatus"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="Pendiente"
                        label="Pendiente"
                        color="grey-10"
                      />
                      <q-radio
                        v-model="taskStatus"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="En progreso"
                        label="En progreso"
                        color="grey-10"
                      />
                      <q-radio
                        v-model="taskStatus"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="Completada"
                        label="Completada"
                        color="grey-10"
                      />
                    </div>

                    <div class="q-mb-md">
                      <q-btn
                        label="Crear tarea"
                        type="submit"
                        color="grey-10"
                        :ripple="{ center: true }"
                      />
                    </div>
                  </q-form>
                </div>

                <div class="q-mb-xl">
                  <q-separator inset />

                  <div class="text-h6 q-mt-md">Tareas creadas</div>

                  <div class="text-left">
                    <ul style="list-style: none" class="q-pa-none">
                      <li v-for="task in tasks" :key="task.name">
                        <q-card dark bordered class="bg-grey-9 my-card q-mb-md">
                          <q-card-section>
                            <div class="text-h6">{{ task.name }}</div>
                            <div class="text-subtitle2">{{ task.status }}</div>
                          </q-card-section>

                          <q-separator inset />

                          <q-card-section>
                            {{ task.description }}
                          </q-card-section>
                        </q-card>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <q-btn
                    label="Crear Proyecto"
                    type="submit"
                    color="grey-10"
                    :ripple="{ center: true }"
                  />

                  <q-btn
                    label="Cancelar"
                    color="grey-10"
                    :ripple="{ center: true }"
                    flat
                    class="q-ml-sm"
                    @click="emptyForm"
                  />
                </div>
              </q-form>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
    <!-- Fin de Modal -->

    <!-- Modal Para ver las tareas -->
    <q-dialog
      v-model="taskModal"
      transition-show="rotate"
      transition-hide="scale"
    >
      <q-card style="width: 50%" class="bg-brown-1 text-grey-10">
        <q-card-section class="bg-grey-10 text-brown-1">
          <div class="text-h4 cursor-pointer">{{ dataTaskName }}</div>
          <div class="text-overline">Click para modificar</div>

          <q-popup-edit
            v-model="dataTaskName"
            :validate="(val) => val.length > 5"
            v-slot="scope"
          >
            <q-input
              autofocus
              dense
              color="grey-10"
              v-model="scope.value"
              :model-value="scope.value"
              hint="Nombre de la tarea"
              :rules="[
                (val) =>
                  scope.validate(val) || $store.getters.obtenerNameErrorMessage,
              ]"
            >
              <template v-slot:after>
                <q-btn
                  flat
                  dense
                  color="negative"
                  icon="cancel"
                  @click.stop.prevent="scope.cancel"
                />

                <q-btn
                  flat
                  dense
                  color="grey-10"
                  icon="check_circle"
                  @click.stop.prevent="scope.set"
                  :disable="
                    scope.validate(scope.value) === false ||
                    scope.initialValue === scope.value
                  "
                />
              </template>
            </q-input>
          </q-popup-edit>
        </q-card-section>

        <q-separator inset />

        <q-card-section style="word-wrap: break-word" class="scroll">
          <div class="text-subtitle2 text-justify q-mb-lg cursor-pointer">
            {{ dataTaskDescription }}
          </div>

          <q-popup-edit
            v-model="dataTaskDescription"
            :validate="(val) => val.length > 5"
            v-slot="scope"
          >
            <q-input
              autofocus
              dense
              color="grey-10"
              v-model="scope.value"
              :model-value="scope.value"
              hint="Descripcion de la tarea"
              :rules="[
                (val) =>
                  scope.validate(val) ||
                  $store.getters.obtenerDescriptionErrorMessage,
              ]"
            >
              <template v-slot:after>
                <q-btn
                  flat
                  dense
                  color="negative"
                  icon="cancel"
                  @click.stop.prevent="scope.cancel"
                />

                <q-btn
                  flat
                  dense
                  color="grey-10"
                  icon="check_circle"
                  @click.stop.prevent="scope.set"
                  :disable="
                    scope.validate(scope.value) === false ||
                    scope.initialValue === scope.value
                  "
                />
              </template>
            </q-input>
          </q-popup-edit>

          <q-separator inset />

          <div class="text-h6 text-center q-mt-md">Estado:</div>

          <div class="q-gutter-sm text-center">
            <q-radio
              v-model="dataTaskStatus"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              val="Pendiente"
              label="Pendiente"
              color="grey-10"
            />
            <q-radio
              v-model="dataTaskStatus"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              val="En progreso"
              label="En progreso"
              color="grey-10"
            />
            <q-radio
              v-model="dataTaskStatus"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              val="Completada"
              label="Completada"
              color="grey-10"
            />
          </div>
        </q-card-section>

        <q-separator inset />

        <q-card-actions align="right">
          <q-btn
            @click="modifyTasks(dataTaskIndex, dataProyectIndex), showLoading()"
            label="Guardar"
            color="grey-10"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Fin de Modal tareas -->

    <!-- Modal Para ver los proyectos -->
    <q-dialog
      v-model="proyectDetailsModal"
      transition-show="rotate"
      transition-hide="scale"
    >
      <q-card style="width: 50%" class="bg-brown-1 text-grey-10">
        <q-card-section class="bg-grey-10 text-brown-1">
          <div class="text-h4 cursor-pointer">{{ dataProyectName }}</div>

          <q-popup-edit
            v-model="dataProyectName"
            :validate="(val) => val.length > 5"
            v-slot="scope"
          >
            <q-input
              autofocus
              dense
              v-model="scope.value"
              :model-value="scope.value"
              hint="Nombre del proyecto"
              color="grey-10"
              :rules="[
                (val) =>
                  scope.validate(val) || $store.getters.obtenerNameErrorMessage,
              ]"
            >
              <template v-slot:after>
                <q-btn
                  flat
                  dense
                  color="negative"
                  icon="cancel"
                  @click.stop.prevent="scope.cancel"
                />

                <q-btn
                  flat
                  dense
                  color="grey-10"
                  icon="check_circle"
                  @click.stop.prevent="scope.set"
                  :disable="
                    scope.validate(scope.value) === false ||
                    scope.initialValue === scope.value
                  "
                />
              </template>
            </q-input>
          </q-popup-edit>
        </q-card-section>

        <q-card-section class="bg-grey-10 text-brown-1">
          <div
            clickable
            class="text-h6 cursor-pointer"
            @click="changeProyectStatus()"
          >
            {{ dataProyectStatus }}
          </div>
          <div class="text-overline">Click para modificar</div>
        </q-card-section>

        <q-separator inset />

        <q-card-section style="word-wrap: break-word" class="scroll">
          <div class="text-subtitle2 text-justify q-mb-lg cursor-pointer">
            {{ dataProyectDescription }}
          </div>

          <q-popup-edit
            v-model="dataProyectDescription"
            :validate="(val) => val.length > 5"
            v-slot="scope"
          >
            <q-input
              autofocus
              dense
              v-model="scope.value"
              :model-value="scope.value"
              hint="Descripcion de la tarea"
              color="grey-10"
              :rules="[
                (val) =>
                  scope.validate(val) ||
                  $store.getters.obtenerDescriptionErrorMessage,
              ]"
            >
              <template v-slot:after>
                <q-btn
                  flat
                  dense
                  color="negative"
                  icon="cancel"
                  @click.stop.prevent="scope.cancel"
                />

                <q-btn
                  flat
                  dense
                  color="grey-10"
                  icon="check_circle"
                  @click.stop.prevent="scope.set"
                  :disable="
                    scope.validate(scope.value) === false ||
                    scope.initialValue === scope.value
                  "
                />
              </template>
            </q-input>
          </q-popup-edit>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <div class="q-mt-md">
            <q-card
              class="q-pa-md no-shadow"
              style="background-color: transparent"
            >
              <div class="text-h6 q-mb-xl">Estado de las tareas:</div>
              <div class="row">
                <ul class="col-12 col-md-4 q-pl-none" style="list-style: none">
                  <li class="q-my-sm text-h6">Pendiente</li>
                  <li class="q-my-md text-h6">En Progreso</li>
                  <li class="q-my-lg text-h6">Completada</li>
                </ul>
                <ul class="q-pa-none col-12 col-md-8">
                  <li
                    v-for="(bar, index) in bars"
                    :key="index"
                    class="bar q-mb-md q-py-sm bg-grey-10 text-brown-1"
                    :style="{ width: bar.width + 'px' }"
                  >
                    <div class="text-subtitle2">{{ bar.value }}</div>
                  </li>
                </ul>
              </div>
            </q-card>
          </div>
        </q-card-section>

        <q-separator inset />

        <q-card-actions align="right">
          <q-btn
            @Click="modifyProyects(dataProyectIndex), showLoading()"
            label="Guardar"
            color="grey-10"
            v-close-popup
          />

          <q-btn
            @Click="deleteProyect(dataProyectIndex), showLoading()"
            flat
            label="Eliminar"
            color="negative"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Fin de Modal proyectos -->

    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
      clickable
      v-ripple
      @click="statusModal = true"
    >
      <q-btn fab icon="add" color="grey-10" />
    </q-page-sticky>

    <q-page-scroller position="top" :scroll-offset="150" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" color="grey-10" />
    </q-page-scroller>
  </q-page>
</template>

<script>
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import { QSpinnerFacebook } from "quasar";
import { mapMutations, mapState } from "vuex";

export default {
  props: {
    searchQuery: String,
  },
  setup(props) {
    const proyectos = ref([]);
    const currentPage = ref(1);
    const projectsPerPage = 3;

    const taskModal = ref(false);
    const dataTaskName = ref("");
    const dataTaskDescription = ref("");
    const dataTaskStatus = ref("");
    const dataTaskIndex = ref("0");
    const dataProyectIndex = ref("0");

    const proyectDetailsModal = ref(false);
    const dataProyectName = ref("");
    const dataProyectDescription = ref("");
    const dataProyectStatus = ref("");
    const countPendingTasks = ref(0);
    const countInProgressTasks = ref(0);
    const countCompleteTasks = ref(0);

    const $q = useQuasar();

    let timer;

    const statusModal = ref(false);
    const checkTask = ref(false);
    const taskStatus = ref("Pendiente");

    const filterOption = ref("all");
    const filterLink = ref("all");

    const filterProjects = (option) => {
      filterOption.value = option;
    };

    const filteredActiveProjects = computed(() => {
      let filtered = proyectos.value;

      if (filterOption.value === "active") {
        filtered = filtered.filter(
          (proyect) => proyect.proyectStatus === "Activo"
        );
      } else if (filterOption.value === "inactive") {
        filtered = filtered.filter(
          (proyect) => proyect.proyectStatus !== "Activo"
        );
      }

      return filtered.filter((proyect) =>
        proyect.proyectName
          .toLowerCase()
          .includes(props.searchQuery.toLowerCase())
      );
    });

    const numbers = ref([]);
    const bars = ref([]);

    // Cargar los proyectos desde localStorage
    const loadFromLocalStorage = () => {
      proyectos.value = JSON.parse(localStorage.getItem("proyectsData")) || [];
    };

    // Filtrar los proyectos según la búsqueda
    const filteredProjects = computed(() => {
      return proyectos.value.filter((proyect) =>
        proyect.proyectName
          .toLowerCase()
          .includes(props.searchQuery.toLowerCase())
      );
    });

    // Calcular el número de páginas
    const numPages = computed(() => {
      return Math.ceil(filteredProjects.value.length / projectsPerPage);
    });

    // Paginar los proyectos
    const paginatedProjects = computed(() => {
      const startIndex = (currentPage.value - 1) * projectsPerPage;
      const endIndex = startIndex + projectsPerPage;
      return filteredProjects.value.slice(startIndex, endIndex);
    });

    // Cargar los proyectos al iniciar
    onMounted(() => {
      loadFromLocalStorage();
    });

    onBeforeUnmount(() => {
      if (timer !== void 0) {
        clearTimeout(timer);
      }
    });

    return {
      proyectos,
      currentPage,
      paginatedProjects,
      numPages,
      statusModal,
      checkTask,
      taskStatus,
      taskModal,
      dataTaskName,
      dataTaskDescription,
      dataTaskStatus,
      dataTaskIndex,
      dataProyectIndex,
      proyectDetailsModal,
      dataProyectName,
      dataProyectDescription,
      dataProyectStatus,
      numbers,
      bars,
      filterOption,
      filterProjects,
      filteredActiveProjects,
      countPendingTasks,
      countInProgressTasks,
      countCompleteTasks,
      filterLink,
    };
  },

  data() {
    return {
      formData: {
        proyectName: "",
        proyectDescription: "",
        taskName: "",
        taskDescription: "",
      },
    };
  },

  mounted() {
    this.bars = this.getDataPoints(this.numbers);
  },

  methods: {
    ...mapMutations(["updateProyects", "updateTasks", "updateProyectData"]),

    submitForm() {
      this.$refs.proyect.validate().then((success) => {
        if (success) {
          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            message: "¡Proyecto creado!",
          });

          this.updateProyects({
            name: this.formData.proyectName,
            description: this.formData.proyectDescription,
            status: "Activo",
          });

          this.emptyForm();
          this.saveProyectData();
          this.showLoading();
          this.reloadPage();
        } else {
          this.$q.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: "Ha ocurrido un error, inténtalo nuevamente",
          });

          this.updateProyects({
            name: "",
            description: "",
            status: "",
          });
        }
      });
    },

    createTask() {
      this.$refs.tasks.validate().then((success) => {
        if (success) {
          this.$q.notify({
            color: "green-4",
            textColor: "white",
            icon: "cloud_done",
            message: "¡Tarea Creada!",
          });

          const newTasks = [...this.tasks];

          newTasks.push({
            name: this.formData.taskName,
            description: this.formData.taskDescription,
            status: this.taskStatus,
          });

          this.updateTasks(newTasks);

          this.emptyTasks();
        } else {
          this.$q.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: "Ha ocurrido un error, inténtalo nuevamente",
          });
        }
      });
    },

    saveProyectData() {
      this.updateProyectData({
        proyectName: this.proyects.name,
        proyectDescription: this.proyects.description,
        proyectStatus: "Activo",
        proyectTasks: this.tasks,
      });

      this.saveToLocalStorage(this.proyectData);
    },

    saveToLocalStorage(obj) {
      let items = JSON.parse(localStorage.getItem("proyectsData")) || [];
      items.push(obj);
      localStorage.setItem("proyectsData", JSON.stringify(items));
    },

    emptyForm() {
      this.formData.proyectName = "";
      this.formData.proyectDescription = "";
      this.formData.taskName = "";
      this.formData.taskDescription = "";
      this.checkTask = false;
      this.taskStatus = "Pendiente";

      this.closeModal();
    },

    reloadPage() {
      setTimeout(() => {
        location.reload();
      }, 2000);
    },

    emptyTasks() {
      this.formData.taskName = "";
      this.formData.taskDescription = "";
      this.taskStatus = "Pendiente";
    },

    closeModal() {
      this.$refs.proyectModal.hide();
    },

    showLoading() {
      this.$q.loading.show({
        spinner: QSpinnerFacebook,
        spinnerColor: "grey-10",
        spinnerSize: 140,
        backgroundColor: "dark",
        message: "",
        messageColor: "",
      });

      // ocultar en s
      this.timer = setTimeout(() => {
        this.$q.loading.hide();
        this.timer = void 0;
      }, 2000);
    },

    modifyTasks(taskIndex, proyectIndex) {
      const modifyTask = {
        name: this.dataTaskName,
        description: this.dataTaskDescription,
        status: this.dataTaskStatus,
      };

      this.proyectos[proyectIndex].proyectTasks[taskIndex] = modifyTask;

      localStorage.setItem("proyectsData", JSON.stringify(this.proyectos));
    },

    changeProyectStatus() {
      if (this.dataProyectStatus === "Activo") {
        this.dataProyectStatus = "Inactivo";
      } else {
        this.dataProyectStatus = "Activo";
      }
    },

    modifyProyects(proyectIndex) {
      const modifyproyects = {
        proyectName: this.dataProyectName,
        proyectDescription: this.dataProyectDescription,
        proyectStatus: this.dataProyectStatus,
        proyectTasks: this.proyectos[proyectIndex].proyectTasks,
      };

      this.proyectos[proyectIndex] = modifyproyects;

      localStorage.setItem("proyectsData", JSON.stringify(this.proyectos));
    },

    deleteProyect(proyectIndex) {
      this.proyectos.splice(proyectIndex, 1);

      localStorage.setItem("proyectsData", JSON.stringify(this.proyectos));
    },

    getStatusCount(tasks) {
      this.countPendingTasks = 0;
      this.countInProgressTasks = 0;
      this.countCompleteTasks = 0;

      for (let index = 0; index < tasks.length; index++) {
        if (tasks[index].status === "Pendiente") {
          this.countPendingTasks++;
        } else {
          if (tasks[index].status === "En progreso") {
            this.countInProgressTasks++;
          } else {
            this.countCompleteTasks++;
          }
        }
      }

      this.numbers = [
        this.countPendingTasks,
        this.countInProgressTasks,
        this.countCompleteTasks,
      ];

      this.bars = this.getDataPoints(this.numbers);
    },

    getDataPoints(numbers) {
      const max = Math.max(...numbers);
      const minwidth = 10;
      const factor = 200 / max;
      return numbers.map((num) => ({
        value: num,
        width: Math.max(num * factor, minwidth),
      }));
    },
  },

  computed: {
    ...mapState(["tasks", "proyectData", "proyects"]),
  },
};
</script>

<style lang="scss">
.bar {
  list-style: none;
}
</style>

<style lang="sass">
.my-menu-link
  color: $grey-10
  background: $brown-1
</style>
