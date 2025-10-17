<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="table-card rounded-lg overflow-hidden elevation-3 mt-10">
          <v-card-title class="primary white--text py-3">
            <!-- Oy navigatsiyasi va qidiruv -->
            <v-row class="d-flex align-center  mb-5 mx-5">
              <v-icon large color="blue" class="mr-2">mdi-book-open-page-variant</v-icon>
              <span class="text-h5 font-weight-bold">O'quvchilar Uyga Vazifa Jadvali</span>
              <v-spacer></v-spacer>
              <v-col cols="12" md="4" class="d-flex align-center justify-center">
                <v-btn icon @click="previousMonth" :disabled="!canGoPrevious">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <div class="mx-3 px-4">
                  <v-icon>mdi-calendar</v-icon>
                  <span>{{ getMonthName(selectedMonth) }} {{ selectedYear }}</span>
                </div>
                <v-btn icon @click="nextMonth" :disabled="!canGoNext">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </v-col>

            </v-row>
            <v-col cols="12" >
              <v-text-field v-model="search" label="Qidirish" dense filled dark clearable
                class="search-field"></v-text-field>
            </v-col>
          </v-card-title>

          <!-- Real-time statistika -->
          <v-card-subtitle class="pa-0">
            <v-row class="ma-0 stat-summary py-2 px-3">
              <v-col cols="12" md="6" sm="6">
                <v-chip :color="isCurrentMonth ? 'success' : 'info'" label outlined class="px-2 stat-chip mr-2">
                  <v-icon left small>mdi-calendar-today</v-icon>
                  <span>{{ isCurrentMonth ? 'Joriy oy' : 'Tanlangan oy' }}: <b>{{ getMonthName(selectedMonth) }} {{
                      selectedYear }}</b></span>
                </v-chip>
                <v-chip color="primary" outlined label class="px-2 stat-chip">
                  <v-icon left small>mdi-account-group</v-icon>
                  <span>Jami o'quvchilar: <b>{{ filteredStudents.length }}</b></span>
                </v-chip>
              </v-col>
            </v-row>
          </v-card-subtitle>

          <!-- Jadval asosiy qismi -->
          <v-data-table :headers="dynamicHeaders" :items="filteredStudents" :items-per-page="10" :search="search"
            :footer-props="{
              'items-per-page-options': [5, 10, 15, 20, -1],
              'items-per-page-text': 'Bir sahifada:',
              'show-first-last-page': true
            }" item-key="id" class="elevation-0" dense :loading="loading" loading-text="Ma'lumotlar yuklanmoqda..."
            no-data-text="Ma'lumotlar topilmadi">
            <!-- O'quvchilar qatori -->
            <template v-slot:item="{ item, index }">
              <tr :class="{ 'homework-row': true, 'even-row': index % 2 === 0 }">
                <td class="text-center font-weight-medium">{{ index + 1 }}</td>
                <td>
                  <div class="d-flex align-center">
                    <v-avatar :color="getRandomColor(item.id)" size="32" class="mr-2">
                      <span class="white--text">{{ getInitials(item) }}</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium text-capitalize">{{ item.surname }} {{ item.name }}</div>
                      <div class="text-caption" v-if="item.teacher && item.teacher.name">
                        <v-icon small class="mr-1">mdi-account-tie</v-icon>
                        {{ item.teacher.name }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Uyga vazifa checkboxlar (12 ta dars) -->
                <td v-for="lessonNum in 12" :key="lessonNum" class="text-center homework-cell px-0">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon small @click="toggleHomework(item.id, lessonNum)" :class="{
                        'homework-icon-btn': true,
                        'completed': isHomeworkCompleted(item, lessonNum),
                        'not-completed': !isHomeworkCompleted(item, lessonNum)
                      }" :disabled="loading" v-bind="attrs" v-on="on">
                        <v-icon small>
                          {{ isHomeworkCompleted(item, lessonNum) ? 'mdi-check-circle' : 'mdi-close-circle-outline' }}
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>{{ lessonNum }}-dars - {{ getMonthName(selectedMonth) }} {{ selectedYear }}</span>
                  </v-tooltip>
                  <div class="lesson-label">{{ lessonNum }}</div>
                </td>

                <!-- Jami bajarilgan vazifalar -->
                <td class="text-center">
                  <v-chip x-small :color="getStudentStatusColor(item)" text-color="white" label>
                    {{ getStudentCompletedCount(item) }}/12
                  </v-chip>
                </td>

                <!-- Foiz -->
                <td class="text-center">
                  <v-chip x-small :color="getStudentPercentageColor(item)" text-color="white" label>
                    {{ getStudentPercentage(item) }}%
                  </v-chip>
                </td>
              </tr>
            </template>

            <!-- Darslik statistika -->
            <template v-slot:body.append>
              <tr class="total-row font-weight-bold">
                <td colspan="2" class="text-subtitle-1 py-2">
                  <v-icon small class="mr-2">mdi-chart-bar</v-icon>
                  Darslik Statistika
                </td>
                <td v-for="lessonNum in 12" :key="lessonNum" class="text-center">
                  <v-badge :content="calculateLessonTotal(lessonNum).toString()"
                    :color="getTotalColor(calculateLessonTotal(lessonNum), filteredStudents.length)" inline
                    class="lesson-badge"></v-badge>
                  <div class="percentage-text">
                    {{ calculateLessonPercentage(lessonNum) }}%
                  </div>
                </td>
                <td colspan="2" class="text-center">
                  <v-chip small :color="getTotalColor(calculateCompletedHomeworks(), calculateTotalHomeworks())"
                    text-color="white">
                    {{ calculateCompletionPercentage() }}%
                  </v-chip>
                </td>
              </tr>
            </template>
          </v-data-table>

          <!-- Statistika grafigi -->
          <v-divider></v-divider>

        </v-card>
      </v-col>
    </v-row>

    <!-- Eng yaxshi o'quvchilar reytingi -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card class="ranking-card rounded-lg overflow-hidden elevation-3">
          <v-card-title class="success white--text py-3">
            <v-icon large color="yellow" class="mr-2">mdi-trophy</v-icon>
            <span class="text-h5 font-weight-bold">Eng Yaxshi O'quvchilar - {{ getMonthName(selectedMonth) }} {{
              selectedYear }}</span>
          </v-card-title>

          <v-data-table :headers="rankingHeaders" :items="rankedStudents" :items-per-page="10" :footer-props="{
            'items-per-page-options': [5, 10, 15, 20, -1],
            'items-per-page-text': 'Bir sahifada:',
            'show-first-last-page': true
          }" class="elevation-0" dense disable-sort>
            <template v-slot:item="{ item, index }">
              <tr :class="{
                'ranking-row': true,
                'top-1': index === 0,
                'top-2': index === 1,
                'top-3': index === 2
              }">
                <td class="text-center">
                  <v-avatar v-if="index < 3" :color="getMedalColor(index)" size="36">
                    <v-icon color="white">{{ getMedalIcon(index) }}</v-icon>
                  </v-avatar>
                  <span v-else class="font-weight-bold text-h6">{{ index + 1 }}</span>
                </td>
                <td>
                  <div class="d-flex align-center">
                    <v-avatar :color="getRandomColor(item.id)" size="36" class="mr-3">
                      <span class="white--text font-weight-bold">{{ getInitials(item) }}</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-bold text-subtitle-1 text-capitalize">{{ item.surname }} {{ item.name }}
                      </div>
                      <div class="text-caption" v-if="item.teacher && item.teacher.name">
                        <v-icon small class="mr-1">mdi-account-tie</v-icon>
                        {{ item.teacher.name }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-center">
                  <v-chip :color="getStudentStatusColor(item)" dark class="font-weight-bold">
                    {{ item.completedCount }}/12
                  </v-chip>
                </td>
                <td class="text-center">
                  <div class="d-flex align-center justify-center">
                    <v-progress-circular :value="item.percentage" :color="getStudentPercentageColor(item)" :size="50"
                      :width="5" class="mr-2">
                      <span class="text-caption font-weight-bold">{{ item.percentage }}%</span>
                    </v-progress-circular>
                  </div>
                </td>
                <td class="text-center">
                  <v-chip v-if="item.percentage === 100" color="success" dark small>
                    <v-icon small left>mdi-star</v-icon>
                    A'lo
                  </v-chip>
                  <v-chip v-else-if="item.percentage >= 90" color="light-green darken-1" dark small>
                    <v-icon small left>mdi-thumb-up</v-icon>
                    Yaxshi
                  </v-chip>
                  <v-chip v-else-if="item.percentage >= 70" color="amber darken-2" dark small>
                    <v-icon small left>mdi-flag</v-icon>
                    O'rtacha
                  </v-chip>
                  <v-chip v-else-if="item.percentage >= 50" color="deep-orange" dark small>
                    <v-icon small left>mdi-alert</v-icon>
                    Past
                  </v-chip>
                  <v-chip v-else color="error" dark small>
                    <v-icon small left>mdi-alert-circle</v-icon>
                    Juda past
                  </v-chip>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { db } from "@/firebaseConfig";
import {
  collection,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import Toastify from "toastify-js";

export default {
  name: "StudentHomeworkTable",
  data() {
    const currentDate = new Date();
    return {
      search: "",
      loading: true,
      unsubscribe: null,
      selectedYear: currentDate.getFullYear(),
      selectedMonth: currentDate.getMonth(),
      currentYear: currentDate.getFullYear(),
      currentMonthIndex: currentDate.getMonth(),
      monthsList: [
        { name: "Yanvar", index: 0 },
        { name: "Fevral", index: 1 },
        { name: "Mart", index: 2 },
        { name: "Aprel", index: 3 },
        { name: "May", index: 4 },
        { name: "Iyun", index: 5 },
        { name: "Iyul", index: 6 },
        { name: "Avgust", index: 7 },
        { name: "Sentabr", index: 8 },
        { name: "Oktabr", index: 9 },
        { name: "Noyabr", index: 10 },
        { name: "Dekabr", index: 11 },
      ],
      currentUser: null,
      role: null,
      students: [],
      colors: ["#1976D2", "#9C27B0", "#E91E63", "#F44336", "#4CAF50", "#FF9800", "#795548", "#607D8B"],
    };
  },
  computed: {
    // Joriy oyni tekshirish
    isCurrentMonth() {
      return this.selectedYear === this.currentYear && this.selectedMonth === this.currentMonthIndex;
    },

    // Oldingi oyga o'tish mumkinmi
    canGoPrevious() {
      const twoMonthsAgo = new Date(this.currentYear, this.currentMonthIndex - 2);
      const selected = new Date(this.selectedYear, this.selectedMonth);
      return selected > twoMonthsAgo;
    },

    // Keyingi oyga o'tish mumkinmi
    canGoNext() {
      const twoMonthsLater = new Date(this.currentYear, this.currentMonthIndex + 2);
      const selected = new Date(this.selectedYear, this.selectedMonth);
      return selected < twoMonthsLater;
    },

    dynamicHeaders() {
      const baseHeaders = [
        { text: "№", align: "center", sortable: false, width: "50px" },
        { text: "F.I.SH", align: "start", sortable: true, value: "fullName", width: "220px" },
      ];

      const lessonHeaders = Array.from({ length: 12 }, (_, i) => ({
        text: (i + 1).toString(),
        align: "center",
        sortable: false,
        value: `homework.${i + 1}`,
        width: "60px"
      }));

      const summaryHeaders = [
        { text: "Jami", align: "center", sortable: true, value: "total", width: "70px" },
        { text: "Foiz", align: "center", sortable: true, value: "percentage", width: "70px" },
      ];

      return [...baseHeaders, ...lessonHeaders, ...summaryHeaders];
    },

    rankingHeaders() {
      return [
        { text: "O'rin", align: "center", sortable: false, width: "80px" },
        { text: "F.I.SH", align: "start", sortable: false, width: "250px" },
        { text: "Bajarilgan", align: "center", sortable: false, width: "120px" },
        { text: "Foiz", align: "center", sortable: false, width: "120px" },
        { text: "Status", align: "center", sortable: false, width: "120px" },
      ];
    },

    filteredStudents() {
      if (!this.students.length) return [];

      let filtered = [...this.students];

      if (this.role && this.role !== "admin") {
        filtered = filtered.filter((student) =>
          student.teacher && student.teacher.name
            ? student.teacher.name.toLowerCase() === this.currentUser.toLowerCase()
            : false
        );
      }

      return filtered;
    },

    rankedStudents() {
      const studentsWithStats = this.filteredStudents.map(student => ({
        ...student,
        completedCount: this.getStudentCompletedCount(student),
        percentage: this.getStudentPercentage(student)
      }));

      // Eng ko'p bajargan va foizi yuqori bo'lganlarni tepaga chiqarish
      return studentsWithStats.sort((a, b) => {
        if (b.completedCount !== a.completedCount) {
          return b.completedCount - a.completedCount;
        }
        return b.percentage - a.percentage;
      });
    }
  },
  methods: {
    previousMonth() {
      if (!this.canGoPrevious) return;

      if (this.selectedMonth === 0) {
        this.selectedMonth = 11;
        this.selectedYear--;
      } else {
        this.selectedMonth--;
      }
      this.showNotification(`${this.getMonthName(this.selectedMonth)} ${this.selectedYear} oyiga o'tildi`, "info");
    },

    nextMonth() {
      if (!this.canGoNext) return;

      if (this.selectedMonth === 11) {
        this.selectedMonth = 0;
        this.selectedYear++;
      } else {
        this.selectedMonth++;
      }
      this.showNotification(`${this.getMonthName(this.selectedMonth)} ${this.selectedYear} oyiga o'tildi`, "info");
    },

    getMedalColor(index) {
      const colors = ["#FFD700", "#C0C0C0", "#CD7F32"];
      return colors[index] || "#757575";
    },

    getMedalIcon() {
      return "mdi-trophy";
    },

    getMonthName(monthIndex) {
      const month = this.monthsList.find(m => m.index === monthIndex);
      return month ? month.name : "";
    },

    setupRealtimeListener() {
      this.loading = true;
      try {
        let studentQuery;
        if (this.role === "admin") {
          studentQuery = collection(db, "students");
        } else {
          studentQuery = query(
            collection(db, "students"),
            where("teacher.name", "==", this.currentUser)
          );
        }

        this.unsubscribe = onSnapshot(studentQuery, (snapshot) => {
          this.students = snapshot.docs.map((doc) => {
            const studentData = doc.data();

            return {
              ...studentData,
              id: doc.id,
              fullName: `${studentData.surname || ''} ${studentData.name || ''}`.trim(),
              homeworks: studentData.homeworks || {}
            };
          });
          this.loading = false;
        }, (error) => {
          console.error("Error in real-time listener:", error);
          this.showNotification("Real-time ma'lumotlarni olishda xatolik yuz berdi.", "error");
          this.loading = false;
        });
      } catch (error) {
        console.error("Error setting up listener:", error);
        this.showNotification("Ma'lumotlarni olishda xatolik yuz berdi.", "error");
        this.loading = false;
      }
    },

    isHomeworkCompleted(student, lessonNum) {
      if (!student.homeworks || !student.homeworks[this.selectedYear]) {
        return false;
      }
      if (!student.homeworks[this.selectedYear][this.selectedMonth]) {
        return false;
      }
      return Boolean(student.homeworks[this.selectedYear][this.selectedMonth][lessonNum]);
    },

    async toggleHomework(studentId, lessonNum) {
      if (this.loading) return;

      this.loading = true;
      const student = this.students.find(s => s.id === studentId);
      if (!student) {
        this.loading = false;
        return;
      }

      const updatedHomeworks = { ...student.homeworks };
      if (!updatedHomeworks[this.selectedYear]) {
        updatedHomeworks[this.selectedYear] = {};
      }
      if (!updatedHomeworks[this.selectedYear][this.selectedMonth]) {
        updatedHomeworks[this.selectedYear][this.selectedMonth] = {};
      }

      updatedHomeworks[this.selectedYear][this.selectedMonth][lessonNum] =
        !updatedHomeworks[this.selectedYear][this.selectedMonth][lessonNum];

      const studentDoc = doc(db, "students", studentId);
      try {
        await updateDoc(studentDoc, { homeworks: updatedHomeworks });

        const monthName = this.getMonthName(this.selectedMonth);
        this.showNotification(
          updatedHomeworks[this.selectedYear][this.selectedMonth][lessonNum]
            ? `${lessonNum}-dars (${monthName} ${this.selectedYear}) bajarildi!`
            : `${lessonNum}-dars (${monthName} ${this.selectedYear}) bajarilmadi!`,
          updatedHomeworks[this.selectedYear][this.selectedMonth][lessonNum] ? "success" : "warning"
        );
      } catch (error) {
        console.error("Error updating homeworks:", error);
        this.showNotification("Uyga vazifalarni yangilashda xatolik yuz berdi.", "error");
      } finally {
        this.loading = false;
      }
    },

    getStudentCompletedCount(student) {
      let count = 0;
      for (let i = 1; i <= 12; i++) {
        if (this.isHomeworkCompleted(student, i)) {
          count++;
        }
      }
      return count;
    },

    getStudentPercentage(student) {
      const completed = this.getStudentCompletedCount(student);
      return Math.round((completed / 12) * 100);
    },

    getStudentStatusColor(student) {
      const percentage = this.getStudentPercentage(student);
      if (percentage >= 90) return "success";
      if (percentage >= 70) return "light-green darken-1";
      if (percentage >= 50) return "amber darken-2";
      if (percentage > 30) return "deep-orange";
      return "error";
    },

    getStudentPercentageColor(student) {
      return this.getStudentStatusColor(student);
    },

    calculateLessonTotal(lessonNum) {
      return this.filteredStudents.reduce((count, student) => {
        return count + (this.isHomeworkCompleted(student, lessonNum) ? 1 : 0);
      }, 0);
    },

    calculateLessonPercentage(lessonNum) {
      const total = this.filteredStudents.length;
      if (total === 0) return 0;
      return Math.round((this.calculateLessonTotal(lessonNum) / total) * 100);
    },

    calculateCompletedHomeworks() {
      let total = 0;
      this.filteredStudents.forEach(student => {
        total += this.getStudentCompletedCount(student);
      });
      return total;
    },

    calculateTotalHomeworks() {
      return this.filteredStudents.length * 12;
    },

    calculateCompletionPercentage() {
      const total = this.calculateTotalHomeworks();
      if (total === 0) return 0;
      return Math.round((this.calculateCompletedHomeworks() / total) * 100);
    },

    showNotification(message, type = "info") {
      const bgColors = {
        success: "linear-gradient(to right, #00b09b, #96c93d)",
        error: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
        warning: "linear-gradient(to right, #f9d423, #ff4e50)",
        info: "linear-gradient(to right, #2193b0, #6dd5ed)"
      };

      Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: bgColors[type] || bgColors.info,
      }).showToast();
    },

    getInitials(student) {
      const nameInitial = student.name ? student.name.charAt(0) : '';
      const surnameInitial = student.surname ? student.surname.charAt(0) : '';
      return (nameInitial + surnameInitial).toUpperCase();
    },

    getRandomColor(id) {
      if (!id) return this.colors[0];
      const colorIndex = id.charAt(0).charCodeAt(0) % this.colors.length;
      return this.colors[colorIndex];
    },

    getTotalColor(completed, total) {
      if (!total || total === 0) return "grey";

      const percentage = (completed / total) * 100;

      if (percentage >= 90) return "success";
      if (percentage >= 70) return "light-green darken-1";
      if (percentage >= 50) return "amber darken-2";
      if (percentage > 30) return "deep-orange";
      return "error";
    }
  },
  created() {
    this.currentUser = localStorage.getItem("teacherName") || "";
    this.role = localStorage.getItem("userRole") || "";

    if (this.currentUser || this.role === "admin") {
      this.setupRealtimeListener();
    } else {
      console.error("No teacher logged in. Please log in to view students.");
      this.showNotification("Iltimos, tizimga kirgan o'qituvchi nomini tekshiring.", "error");
      this.loading = false;
    }
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
};
</script>

<style scoped>
.table-card {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.homework-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.even-row {
  background-color: rgba(0, 0, 0, 0.01);
}

.homework-icon-btn {
  width: 28px !important;
  height: 28px !important;
  margin: 0 auto;
  transition: all 0.2s ease;
}

.completed {
  color: #4CAF50 !important;
}

.not-completed {
  color: #bdbdbd !important;
}

.lesson-label {
  font-size: 10px;
  margin-top: 2px;
  color: #757575;
}

.stat-card {
  transition: transform 0.2s;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.homework-cell {
  padding: 0 2px !important;
}

.stat-chip {
  font-size: 12px;
  height: 28px;
  justify-content: flex-start;
}

.lesson-badge {
  font-weight: bold;
}

.percentage-text {
  font-size: 10px;
  color: #757575;
  margin-top: 2px;
}

.stat-divider {
  height: 4px;
  width: 100%;
}

.total-row {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Reyting jadvali stillari */
.ranking-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.ranking-row {
  transition: all 0.3s ease;
}

.ranking-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
  transform: translateX(5px);
}

.top-1 {
  background: linear-gradient(to right, rgba(255, 215, 0, 0.1), transparent) !important;
  border-left: 4px solid #FFD700 !important;
}

.top-2 {
  background: linear-gradient(to right, rgba(192, 192, 192, 0.1), transparent) !important;
  border-left: 4px solid #C0C0C0 !important;
}

.top-3 {
  background: linear-gradient(to right, rgba(205, 127, 50, 0.1), transparent) !important;
  border-left: 4px solid #CD7F32 !important;
}

/* Responsive dizayn */
@media (max-width: 960px) {
  .search-field {
    max-width: 100%;
  }

  .stat-chip {
    font-size: 11px;
    margin-bottom: 4px;
  }
}

@media (max-width: 600px) {
  .v-data-table {
    overflow-x: auto;
  }

  .stats-panel {
    padding: 8px !important;
  }

  .homework-cell {
    min-width: 50px;
  }

  .stat-chip {
    font-size: 10px;
    margin-bottom: 4px;
  }

  .search-field {
    max-width: 100%;
  }

  .text-h5 {
    font-size: 1.25rem !important;
  }

  .v-card-title {
    padding: 12px !important;
  }
}
</style>