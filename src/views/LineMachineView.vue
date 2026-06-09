<template>
  <Toast position="top-right" />

  <MainLayout>
    <div class="min-h-screen bg-slate-50 p-3 sm:p-4 lg:p-6">
      <div class="mx-auto max-w-7xl space-y-5">
        <!-- HEADER -->
        <section
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div
            class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <h1 class="text-xl font-bold text-slate-900 sm:text-2xl">
                Quản lý Line & Machine
              </h1>

              <p class="mt-1 text-sm text-slate-500">
                Quản lý danh sách line sản xuất, xưởng và máy theo từng line.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="store.loading"
                @click="openCreateLineModal"
              >
                + Thêm Line
              </button>

              <button
                type="button"
                class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="store.loading || store.lines.length === 0"
                @click="openCreateMachineModal()"
              >
                + Thêm Machine
              </button>

              <button
                type="button"
                class="col-span-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1"
                :disabled="store.loading || store.lines.length < 2"
                @click="openCopyMachinesModal()"
              >
                Copy máy
              </button>
            </div>
          </div>

          <!-- STATS -->
          <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div class="rounded-2xl bg-slate-50 p-4">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Tổng Line
              </p>
              <p class="mt-1 text-2xl font-bold text-slate-900">
                {{ store.lines.length }}
              </p>
            </div>

            <div class="rounded-2xl bg-slate-50 p-4">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Tổng Machine
              </p>
              <p class="mt-1 text-2xl font-bold text-slate-900">
                {{ store.machines.length }}
              </p>
            </div>

            <div class="rounded-2xl bg-slate-50 p-4">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                SMD
              </p>
              <p class="mt-1 text-2xl font-bold text-blue-700">
                {{ smdLineCount }}
              </p>
            </div>

            <div class="rounded-2xl bg-slate-50 p-4">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Mainline
              </p>
              <p class="mt-1 text-2xl font-bold text-green-700">
                {{ mainlineLineCount }}
              </p>
            </div>
          </div>
        </section>

        <!-- FILTER -->
        <section
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div class="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                Tìm kiếm
              </label>

              <input
                v-model.trim="searchText"
                type="text"
                placeholder="Tìm theo tên line hoặc machine..."
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                Xưởng
              </label>

              <div class="grid grid-cols-3 gap-2 sm:flex">
                <button
                  type="button"
                  class="rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95"
                  :class="
                    areaFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  "
                  @click="areaFilter = 'ALL'"
                >
                  Tất cả
                </button>

                <button
                  type="button"
                  class="rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95"
                  :class="
                    areaFilter === 'SMD'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  "
                  @click="areaFilter = 'SMD'"
                >
                  SMD
                </button>

                <button
                  type="button"
                  class="rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95"
                  :class="
                    areaFilter === 'Mainline'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  "
                  @click="areaFilter = 'Mainline'"
                >
                  Mainline
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ERROR -->
        <div
          v-if="store.error"
          class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {{ store.error }}
        </div>

        <!-- LOADING -->
        <div
          v-if="store.loading && !store.lines.length"
          class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
        >
          <div
            class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
          ></div>

          <p class="mt-3 text-sm font-medium text-slate-500">
            Đang tải dữ liệu...
          </p>
        </div>

        <!-- EMPTY -->
        <div
          v-else-if="filteredLines.length === 0"
          class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm"
        >
          <p class="text-base font-semibold text-slate-800">
            Không có dữ liệu phù hợp
          </p>

          <p class="mt-1 text-sm text-slate-500">
            Hãy thử đổi bộ lọc hoặc thêm line mới.
          </p>

          <button
            type="button"
            class="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
            @click="openCreateLineModal"
          >
            + Thêm Line
          </button>
        </div>

        <!-- LINE LIST -->
        <section v-else class="space-y-4">
          <div
            class="lm-line-toolbar rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <p class="text-base font-bold text-slate-900">Danh sách Line</p>
              <p class="mt-1 text-sm text-slate-500">
                {{ filteredLines.length }} line phù hợp bộ lọc. Line có nhiều máy
                sẽ được thu gọn để dễ theo dõi.
              </p>
            </div>

            <div class="lm-line-toolbar-actions">
              <button
                type="button"
                class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
                @click="expandAllLines"
              >
                Mở tất cả
              </button>

              <button
                type="button"
                class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
                @click="collapseAllLines"
              >
                Thu gọn
              </button>
            </div>
          </div>

          <article
            v-for="line in filteredLines"
            :key="line.id"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <!-- LINE HEADER / ACCORDION SUMMARY -->
            <div
              class="lm-line-toggle flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
              role="button"
              tabindex="0"
              @click="toggleLine(line.id)"
              @keydown.enter.prevent="toggleLine(line.id)"
              @keydown.space.prevent="toggleLine(line.id)"
            >
              <div class="flex items-start gap-3 min-w-0">
                <span
                  class="lm-line-chevron shrink-0"
                  :class="{ 'is-open': isLineExpanded(line.id) }"
                >
                  ›
                </span>

                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="truncate text-lg font-bold text-slate-900">
                      {{ line.lineName }}
                    </h2>

                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-bold"
                      :class="getAreaBadgeClass(line.areaPart)"
                    >
                      {{ line.areaPart || "N/A" }}
                    </span>

                    <span
                      class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                    >
                      ID: {{ line.id }}
                    </span>

                    <span
                      class="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700"
                    >
                      {{ getMachinesByLineId(line.id).length }} máy
                    </span>
                  </div>

                  <p class="mt-1 text-sm text-slate-500">
                    {{
                      isLineExpanded(line.id)
                        ? "Đang mở danh sách machine"
                        : "Đang thu gọn danh sách machine"
                    }}
                    <span
                      v-if="getMachinesByLineId(line.id).length >= 8"
                      class="lm-line-hint"
                    >
                      · line này có nhiều máy
                    </span>
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4" @click.stop>
                <button
                  type="button"
                  class="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
                  @click="openCreateMachineModal(line.id)"
                >
                  + Máy
                </button>

                <button
                  type="button"
                  class="rounded-xl bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="store.lines.length < 2"
                  @click="openCopyMachinesModal(line.id)"
                >
                  Copy
                </button>

                <button
                  type="button"
                  class="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-95"
                  @click="openEditLineModal(line)"
                >
                  Sửa
                </button>

                <button
                  type="button"
                  class="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 active:scale-95"
                  @click="askDeleteLine(line)"
                >
                  Xóa
                </button>
              </div>
            </div>

            <Transition name="lm-accordion">
              <div v-if="isLineExpanded(line.id)">
                <!-- DESKTOP MACHINE TABLE - SCROLL RIÊNG TỪNG LINE -->
                <div class="hidden lg:block">
                  <div class="lm-machine-scroll">
                    <table class="w-full table-fixed">
                      <thead class="lm-sticky-head bg-slate-50">
                        <tr>
                          <th
                            class="w-22 px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                          >
                            ID
                          </th>

                          <th
                            class="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                          >
                            Tên Machine
                          </th>

                          <th
                            class="w-37.5 px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                          >
                            Line ID
                          </th>

                          <th
                            class="w-55 px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500"
                          >
                            Thao tác
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr
                          v-if="getMachinesByLineId(line.id).length === 0"
                          class="border-t border-slate-100"
                        >
                          <td
                            colspan="4"
                            class="px-5 py-8 text-center text-sm text-slate-500"
                          >
                            Line này chưa có machine.
                          </td>
                        </tr>

                        <tr
                          v-for="machine in getMachinesByLineId(line.id)"
                          :key="machine.id"
                          class="border-t border-slate-100 transition hover:bg-slate-50"
                        >
                          <td class="px-5 py-3 text-sm font-semibold text-slate-700">
                            #{{ machine.id }}
                          </td>

                          <td class="px-5 py-3">
                            <p class="truncate text-sm font-semibold text-slate-900">
                              {{ machine.machineName }}
                            </p>
                          </td>

                          <td class="px-5 py-3 text-sm text-slate-600">
                            {{ machine.lineId }}
                          </td>

                          <td class="px-5 py-3">
                            <div class="flex justify-end gap-2">
                              <button
                                type="button"
                                class="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 active:scale-95"
                                @click="openEditMachineModal(machine)"
                              >
                                Sửa
                              </button>

                              <button
                                type="button"
                                class="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 active:scale-95"
                                @click="askDeleteMachine(machine)"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- MOBILE/TABLET MACHINE CARDS - SCROLL RIÊNG TỪNG LINE -->
                <div class="lg:hidden">
                  <div class="lm-machine-mobile-scroll grid gap-3 p-4">
                    <div
                      v-if="getMachinesByLineId(line.id).length === 0"
                      class="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500"
                    >
                      Line này chưa có machine.
                    </div>

                    <div
                      v-for="machine in getMachinesByLineId(line.id)"
                      :key="machine.id"
                      class="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <p class="truncate text-base font-bold text-slate-900">
                            {{ machine.machineName }}
                          </p>

                          <p class="mt-1 text-xs font-medium text-slate-500">
                            ID: {{ machine.id }} · Line ID: {{ machine.lineId }}
                          </p>
                        </div>

                        <div class="flex shrink-0 gap-2">
                          <button
                            type="button"
                            class="rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700 active:scale-95"
                            @click="openEditMachineModal(machine)"
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            class="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 active:scale-95"
                            @click="askDeleteMachine(machine)"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </article>
        </section>
      </div>
    </div>
  </MainLayout>

  <!-- LINE MODAL -->
  <Teleport to="body">
    <div
      v-if="lineModal.visible"
      class="lm-modal-overlay"
      @click.self="closeLineModal"
    >
      <div class="lm-modal-card">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              {{ lineModal.mode === "create" ? "Thêm Line" : "Sửa Line" }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              {{
                lineModal.mode === "create"
                  ? "Tạo line mới theo xưởng."
                  : "Chỉ hỗ trợ sửa tên line"
              }}
            </p>
          </div>

          <button
            type="button"
            class="lm-modal-close"
            aria-label="Đóng"
            @click="closeLineModal"
          >
            ✕
          </button>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="submitLineForm">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              Tên Line
            </label>

            <input
              v-model.trim="lineForm.lineName"
              type="text"
              placeholder="Ví dụ: SA6, S12..."
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              Xưởng
            </label>

            <select
              v-model="lineForm.areaPart"
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              :disabled="lineModal.mode === 'edit'"
            >
              <option value="SMD">SMD</option>
              <option value="Mainline">Mainline</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
              @click="closeLineModal"
            >
              Hủy
            </button>

            <button
              type="submit"
              class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="submitting"
            >
              {{ submitting ? "Đang lưu..." : "Lưu" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <!-- MACHINE MODAL -->
  <Teleport to="body">
    <div
      v-if="machineModal.visible"
      class="lm-modal-overlay"
      @click.self="closeMachineModal"
    >
      <div class="lm-modal-card">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              {{
                machineModal.mode === "create" ? "Thêm Machine" : "Sửa Machine"
              }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              Chọn line chứa machine. Có thể chuyển machine sang line khác.
            </p>
          </div>

          <button
            type="button"
            class="lm-modal-close"
            aria-label="Đóng"
            @click="closeMachineModal"
          >
            ✕
          </button>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="submitMachineForm">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              Tên Machine
            </label>

            <input
              v-model.trim="machineForm.machineName"
              type="text"
              placeholder="Ví dụ: SPI, AOI, Reflow..."
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              Thuộc Line
            </label>

            <select
              v-model.number="machineForm.lineId"
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option
                v-for="line in store.lines"
                :key="line.id"
                :value="line.id"
              >
                {{ line.lineName }} - {{ line.areaPart }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
              @click="closeMachineModal"
            >
              Hủy
            </button>

            <button
              type="submit"
              class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="submitting"
            >
              {{ submitting ? "Đang lưu..." : "Lưu" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <!-- COPY MACHINES MODAL -->
  <Teleport to="body">
    <div
      v-if="copyMachinesModal.visible"
      class="lm-modal-overlay"
      @click.self="closeCopyMachinesModal"
    >
      <div class="lm-modal-card lm-modal-card-wide">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              Copy machine
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              Chọn line nguồn và line đích. Máy trùng tên trong line đích sẽ
              được tự động bỏ qua.
            </p>
          </div>

          <button
            type="button"
            class="lm-modal-close"
            aria-label="Đóng"
            @click="closeCopyMachinesModal"
          >
            ✕
          </button>
        </div>

        <form class="lm-copy-form" @submit.prevent="submitCopyMachines">
          <div class="lm-copy-grid">
            <section class="lm-copy-panel">
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                  Line nguồn
                </label>

                <select
                  v-model.number="copyMachinesForm.sourceLineId"
                  class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                  @change="handleCopySourceChange"
                >
                  <option
                    v-for="line in store.lines"
                    :key="line.id"
                    :value="line.id"
                  >
                    {{ line.lineName }} - {{ line.areaPart }} ({{
                      getMachinesByLineId(line.id).length
                    }}
                    máy)
                  </option>
                </select>

                <p class="mt-2 text-xs font-medium text-slate-500">
                  Đang chọn:
                  <span class="font-bold text-slate-700">
                    {{ selectedSourceLineLabel }}
                  </span>
                  · {{ selectedSourceMachines.length }} machine
                </p>
              </div>

              <div
                v-if="selectedSourceMachines.length"
                class="lm-copy-box"
              >
                <div class="lm-copy-section-title">
                  <p>Danh sách máy sẽ copy</p>
                  <span>{{ selectedSourceMachines.length }} máy</span>
                </div>

                <div class="lm-copy-chip-scroll">
                  <span
                    v-for="machine in selectedSourceMachines"
                    :key="machine.id"
                    class="lm-machine-chip"
                  >
                    {{ machine.machineName }}
                  </span>
                </div>
              </div>

              <div
                v-else
                class="rounded-2xl border border-dashed border-slate-300 bg-amber-50 p-4 text-sm font-medium text-amber-700"
              >
                Line nguồn chưa có machine để copy.
              </div>

              <div class="lm-copy-summary">
                <p class="font-bold">Tóm tắt</p>
                <p class="mt-1">
                  Copy từ
                  <span class="font-bold">{{ selectedSourceLineLabel }}</span>
                  sang
                  <span class="font-bold">
                    {{ copyMachinesForm.targetLineIds.length }}
                  </span>
                  line đích.
                </p>
                <p>
                  Machine mới dự kiến tạo:
                  <span class="font-bold">{{ totalCopyAddCount }}</span>.
                </p>
              </div>
            </section>

            <section class="lm-copy-panel">
              <div class="lm-copy-target-head">
                <div>
                  <label class="block text-sm font-semibold text-slate-700">
                    Line đích
                  </label>
                  <p class="mt-1 text-xs font-medium text-slate-500">
                    Chọn một hoặc nhiều line cần nhận danh sách máy.
                  </p>
                </div>

                <div class="lm-copy-target-actions">
                  <button
                    type="button"
                    class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95"
                    @click="selectAllCopyTargets"
                  >
                    Chọn tất cả
                  </button>

                  <button
                    type="button"
                    class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95"
                    @click="clearCopyTargets"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div class="lm-copy-target-list">
                <label
                  v-for="line in copyTargetLines"
                  :key="line.id"
                  class="lm-copy-target-item"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-bold text-slate-800">
                      {{ line.lineName }}
                    </p>
                    <p class="mt-1 text-xs text-slate-500">
                      {{ line.areaPart }} · hiện có
                      {{ getMachinesByLineId(line.id).length }} máy · thêm
                      {{ getCopyAddCount(line.id) }} máy mới
                    </p>
                  </div>

                  <input
                    v-model="copyMachinesForm.targetLineIds"
                    type="checkbox"
                    class="lm-copy-checkbox"
                    :value="line.id"
                  />
                </label>
              </div>
            </section>
          </div>

          <div class="lm-copy-footer">
            <button
              type="button"
              class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
              @click="closeCopyMachinesModal"
            >
              Hủy
            </button>

            <button
              type="submit"
              class="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="
                submitting ||
                selectedSourceMachines.length === 0 ||
                copyMachinesForm.targetLineIds.length === 0
              "
            >
              {{ submitting ? "Đang copy..." : "Copy machine" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <!-- CONFIRM MODAL -->
  <Teleport to="body">
    <div
      v-if="confirmModal.visible"
      class="lm-modal-overlay"
      @click.self="closeConfirmModal"
    >
      <div class="lm-modal-card">
        <h3 class="text-lg font-bold text-slate-900">
          {{ confirmModal.title }}
        </h3>

        <p class="mt-2 text-sm leading-6 text-slate-600">
          {{ confirmModal.message }}
        </p>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
            @click="closeConfirmModal"
          >
            Hủy
          </button>

          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="submitting"
            @click="submitConfirmDelete"
          >
            {{ submitting ? "Đang xóa..." : "Xóa" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import MainLayout from "@/components/MainLayout.vue";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { computed, onMounted, reactive, ref } from "vue";
import { useLineMachineStore } from "@/stores/line_machine";
import type { Line, Machine } from "@/types/line_machine.types";

type AreaFilter = "ALL" | "SMD" | "Mainline";
type ModalMode = "create" | "edit";
type DeleteTarget = "line" | "machine";
type ToastSeverity = "success" | "info" | "warn" | "error";

const store = useLineMachineStore();
const toast = useToast();

const searchText = ref("");
const areaFilter = ref<AreaFilter>("ALL");
const submitting = ref(false);
const expandedLineIds = ref<Set<number>>(new Set());

const lineModal = reactive<{
  visible: boolean;
  mode: ModalMode;
  editingId: number | null;
}>({
  visible: false,
  mode: "create",
  editingId: null,
});

const machineModal = reactive<{
  visible: boolean;
  mode: ModalMode;
  editingId: number | null;
}>({
  visible: false,
  mode: "create",
  editingId: null,
});

const copyMachinesModal = reactive<{
  visible: boolean;
}>({
  visible: false,
});

const confirmModal = reactive<{
  visible: boolean;
  target: DeleteTarget | null;
  id: number | null;
  title: string;
  message: string;
}>({
  visible: false,
  target: null,
  id: null,
  title: "",
  message: "",
});

const lineForm = reactive({
  lineName: "",
  areaPart: "SMD" as "SMD" | "Mainline",
});

const machineForm = reactive({
  machineName: "",
  lineId: 0,
});

const copyMachinesForm = reactive<{
  sourceLineId: number;
  targetLineIds: number[];
}>({
  sourceLineId: 0,
  targetLineIds: [],
});

const smdLineCount = computed(() => {
  return store.lines.filter((line) => normalizeText(line.areaPart) === "smd")
    .length;
});

const mainlineLineCount = computed(() => {
  return store.lines.filter(
    (line) => normalizeText(line.areaPart) === "mainline",
  ).length;
});

const machineMapByLineId = computed(() => {
  const map = new Map<number, Machine[]>();

  for (const machine of store.machines) {
    const current = map.get(machine.lineId) ?? [];
    current.push(machine);
    map.set(machine.lineId, current);
  }

  return map;
});

const filteredLines = computed(() => {
  const keyword = normalizeText(searchText.value);

  return store.lines.filter((line) => {
    const matchArea =
      areaFilter.value === "ALL" || line.areaPart === areaFilter.value;

    if (!matchArea) return false;
    if (!keyword) return true;

    const lineName = normalizeText(line.lineName);
    const areaPart = normalizeText(line.areaPart);
    const machines = getMachinesByLineId(line.id);

    const matchLine =
      lineName.includes(keyword) ||
      areaPart.includes(keyword) ||
      String(line.id).includes(keyword);

    const matchMachine = machines.some((machine) => {
      return (
        normalizeText(machine.machineName).includes(keyword) ||
        String(machine.id).includes(keyword)
      );
    });

    return matchLine || matchMachine;
  });
});

const selectedSourceMachines = computed(() => {
  return getMachinesByLineId(copyMachinesForm.sourceLineId);
});

const selectedSourceLine = computed(() => {
  return store.lines.find((line) => line.id === copyMachinesForm.sourceLineId);
});

const selectedSourceLineLabel = computed(() => {
  if (!selectedSourceLine.value) return "Chưa chọn line nguồn";

  return `${selectedSourceLine.value.lineName} - ${selectedSourceLine.value.areaPart}`;
});

const copyTargetLines = computed(() => {
  return store.lines.filter((line) => line.id !== copyMachinesForm.sourceLineId);
});

const totalCopyAddCount = computed(() => {
  return copyMachinesForm.targetLineIds.reduce((total, lineId) => {
    return total + getCopyAddCount(lineId);
  }, 0);
});

onMounted(async () => {
  if (!store.lines.length && !store.machines.length) {
    await loadInitialData();
  }
});

async function loadInitialData() {
  try {
    await store.fetchInitialData();
  } catch (error) {
    showToast(
      "error",
      "Lỗi tải dữ liệu",
      getErrorMessage(error, "Không thể tải danh sách line / machine."),
    );
  }
}

async function refreshAfterMutation() {
  try {
    await store.fetchInitialData();
  } catch (error) {
    showToast(
      "warn",
      "Đã thực hiện nhưng chưa tải lại dữ liệu",
      getErrorMessage(error, "Vui lòng tải lại trang để cập nhật danh sách."),
    );
  }
}

function isLineExpanded(lineId: number) {
  return expandedLineIds.value.has(lineId);
}

function toggleLine(lineId: number) {
  const next = new Set(expandedLineIds.value);

  if (next.has(lineId)) {
    next.delete(lineId);
  } else {
    next.add(lineId);
  }

  expandedLineIds.value = next;
}

function expandAllLines() {
  expandedLineIds.value = new Set(filteredLines.value.map((line) => line.id));
}

function collapseAllLines() {
  expandedLineIds.value = new Set();
}

function normalizeText(value?: string | number | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeMachineName(value?: string | number | null) {
  return normalizeText(value).replace(/\s+/g, " ");
}

function getMachinesByLineId(lineId: number) {
  return machineMapByLineId.value.get(lineId) ?? [];
}

function getAreaBadgeClass(areaPart?: string | null) {
  if (areaPart === "SMD") {
    return "bg-blue-50 text-blue-700";
  }

  if (areaPart === "Mainline") {
    return "bg-green-50 text-green-700";
  }

  return "bg-slate-100 text-slate-600";
}

function showToast(severity: ToastSeverity, summary: string, detail: string) {
  toast.add({
    severity,
    summary,
    detail,
    life: severity === "error" ? 4500 : 3000,
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (error instanceof Error && error.message) {
    return error.message;
  }

  const maybeError = error as {
    response?: { data?: { message?: string; title?: string } | string };
    message?: string;
  };

  if (typeof maybeError.response?.data === "string") {
    return maybeError.response.data;
  }

  if (maybeError.response?.data?.message) {
    return maybeError.response.data.message;
  }

  if (maybeError.response?.data?.title) {
    return maybeError.response.data.title;
  }

  if (maybeError.message) return maybeError.message;

  return fallback;
}

function openCreateLineModal() {
  if (submitting.value) return;

  lineModal.visible = true;
  lineModal.mode = "create";
  lineModal.editingId = null;

  lineForm.lineName = "";
  lineForm.areaPart = areaFilter.value === "Mainline" ? "Mainline" : "SMD";
}

function openEditLineModal(line: Line) {
  if (submitting.value) return;

  lineModal.visible = true;
  lineModal.mode = "edit";
  lineModal.editingId = line.id;

  lineForm.lineName = line.lineName;
  lineForm.areaPart = line.areaPart === "Mainline" ? "Mainline" : "SMD";
}

function resetLineForm() {
  lineModal.editingId = null;
  lineForm.lineName = "";
  lineForm.areaPart = "SMD";
}

function closeLineModal(force = false) {
  if (submitting.value && !force) return;

  lineModal.visible = false;
  resetLineForm();
}

async function submitLineForm() {
  const lineName = lineForm.lineName.trim();

  if (!lineName) {
    showToast("warn", "Thiếu thông tin", "Vui lòng nhập tên line.");
    return;
  }

  if (submitting.value) return;

  submitting.value = true;
  const isCreate = lineModal.mode === "create";

  try {
    if (isCreate) {
      await store.createLine({
        lineName,
        areaPart: lineForm.areaPart,
      });
    } else {
      if (!lineModal.editingId) {
        showToast("error", "Thiếu ID line", "Không tìm thấy line cần cập nhật.");
        return;
      }

      await store.updateLine(lineModal.editingId, {
        lineName,
      });
    }

    await refreshAfterMutation();

    closeLineModal(true);
    showToast(
      "success",
      isCreate ? "Thêm line thành công" : "Cập nhật line thành công",
      isCreate
        ? `Đã thêm line ${lineName}.`
        : `Đã cập nhật line ${lineName}.`,
    );
  } catch (error) {
    showToast(
      "error",
      isCreate ? "Thêm line thất bại" : "Cập nhật line thất bại",
      getErrorMessage(error, "Vui lòng kiểm tra lại thông tin và thử lại."),
    );
  } finally {
    submitting.value = false;
  }
}

function openCreateMachineModal(defaultLineId?: number) {
  if (submitting.value) return;

  if (!store.lines.length) {
    showToast("warn", "Chưa có line", "Vui lòng tạo Line trước khi thêm Machine.");
    return;
  }

  machineModal.visible = true;
  machineModal.mode = "create";
  machineModal.editingId = null;

  machineForm.machineName = "";
  machineForm.lineId = defaultLineId || store.lines[0]?.id || 0;
}

function openEditMachineModal(machine: Machine) {
  if (submitting.value) return;

  machineModal.visible = true;
  machineModal.mode = "edit";
  machineModal.editingId = machine.id;

  machineForm.machineName = machine.machineName;
  machineForm.lineId = machine.lineId;
}

function resetMachineForm() {
  machineModal.editingId = null;
  machineForm.machineName = "";
  machineForm.lineId = 0;
}

function closeMachineModal(force = false) {
  if (submitting.value && !force) return;

  machineModal.visible = false;
  resetMachineForm();
}

async function submitMachineForm() {
  const machineName = machineForm.machineName.trim();

  if (!machineName) {
    showToast("warn", "Thiếu thông tin", "Vui lòng nhập tên machine.");
    return;
  }

  if (!machineForm.lineId) {
    showToast("warn", "Thiếu thông tin", "Vui lòng chọn line.");
    return;
  }

  if (submitting.value) return;

  submitting.value = true;
  const isCreate = machineModal.mode === "create";

  try {
    if (isCreate) {
      await store.createMachine({
        machineName,
        lineId: machineForm.lineId,
      });
    } else {
      if (!machineModal.editingId) {
        showToast(
          "error",
          "Thiếu ID machine",
          "Không tìm thấy machine cần cập nhật.",
        );
        return;
      }

      await store.updateMachine(machineModal.editingId, {
        machineName,
        lineId: machineForm.lineId,
      });
    }

    await refreshAfterMutation();

    closeMachineModal(true);
    showToast(
      "success",
      isCreate ? "Thêm machine thành công" : "Cập nhật machine thành công",
      isCreate
        ? `Đã thêm machine ${machineName}.`
        : `Đã cập nhật machine ${machineName}.`,
    );
  } catch (error) {
    showToast(
      "error",
      isCreate ? "Thêm machine thất bại" : "Cập nhật machine thất bại",
      getErrorMessage(error, "Vui lòng kiểm tra lại thông tin và thử lại."),
    );
  } finally {
    submitting.value = false;
  }
}

function openCopyMachinesModal(sourceLineId?: number) {
  if (submitting.value) return;

  if (store.lines.length < 2) {
    showToast(
      "warn",
      "Chưa đủ line",
      "Cần ít nhất 2 line để copy machine từ line này sang line khác.",
    );
    return;
  }

  const defaultSourceLine =
    (sourceLineId && store.lines.find((line) => line.id === sourceLineId)) ||
    store.lines.find((line) => normalizeText(line.lineName) === "s11") ||
    store.lines.find((line) => getMachinesByLineId(line.id).length > 0) ||
    store.lines[0];

  copyMachinesModal.visible = true;
  copyMachinesForm.sourceLineId = defaultSourceLine?.id || 0;
  copyMachinesForm.targetLineIds = copyTargetLines.value.map((line) => line.id);
}

function handleCopySourceChange() {
  copyMachinesForm.targetLineIds = copyMachinesForm.targetLineIds.filter(
    (lineId) => lineId !== copyMachinesForm.sourceLineId,
  );
}

function resetCopyMachinesForm() {
  copyMachinesForm.sourceLineId = 0;
  copyMachinesForm.targetLineIds = [];
}

function closeCopyMachinesModal(force = false) {
  if (submitting.value && !force) return;

  copyMachinesModal.visible = false;
  resetCopyMachinesForm();
}

function selectAllCopyTargets() {
  copyMachinesForm.targetLineIds = copyTargetLines.value.map((line) => line.id);
}

function clearCopyTargets() {
  copyMachinesForm.targetLineIds = [];
}

function getCopyAddCount(targetLineId: number) {
  const targetMachineNames = new Set(
    getMachinesByLineId(targetLineId).map((machine) =>
      normalizeMachineName(machine.machineName),
    ),
  );

  return selectedSourceMachines.value.filter((machine) => {
    return !targetMachineNames.has(normalizeMachineName(machine.machineName));
  }).length;
}

function getMachinesNeedCopyToLine(targetLineId: number) {
  const targetMachineNames = new Set(
    getMachinesByLineId(targetLineId).map((machine) =>
      normalizeMachineName(machine.machineName),
    ),
  );

  return selectedSourceMachines.value.filter((machine) => {
    return !targetMachineNames.has(normalizeMachineName(machine.machineName));
  });
}

async function submitCopyMachines() {
  if (submitting.value) return;

  if (!copyMachinesForm.sourceLineId) {
    showToast("warn", "Thiếu line nguồn", "Vui lòng chọn line nguồn để copy.");
    return;
  }

  if (!selectedSourceMachines.value.length) {
    showToast(
      "warn",
      "Line nguồn chưa có máy",
      "Line nguồn chưa có machine để copy.",
    );
    return;
  }

  if (!copyMachinesForm.targetLineIds.length) {
    showToast("warn", "Thiếu line đích", "Vui lòng chọn ít nhất một line đích.");
    return;
  }

  const copyJobs = copyMachinesForm.targetLineIds.flatMap((targetLineId) => {
    return getMachinesNeedCopyToLine(targetLineId).map((machine) => ({
      machineName: machine.machineName,
      lineId: targetLineId,
    }));
  });

  if (!copyJobs.length) {
    showToast(
      "info",
      "Không có máy mới cần copy",
      "Các line đích đã có đủ machine trùng tên với line nguồn.",
    );
    return;
  }

  submitting.value = true;

  let successCount = 0;

  try {
    for (const job of copyJobs) {
      await store.createMachine(job);
      successCount += 1;
    }

    await refreshAfterMutation();

    closeCopyMachinesModal(true);
    showToast(
      "success",
      "Copy machine thành công",
      `Đã tạo thêm ${successCount} machine từ ${selectedSourceLineLabel.value}.`,
    );
  } catch (error) {
    await refreshAfterMutation();

    showToast(
      "error",
      "Copy machine chưa hoàn tất",
      `${successCount}/${copyJobs.length} machine đã được tạo. ${getErrorMessage(
        error,
        "Vui lòng thử lại với các machine còn thiếu.",
      )}`,
    );
  } finally {
    submitting.value = false;
  }
}

function askDeleteLine(line: Line) {
  if (submitting.value) return;

  const machineCount = getMachinesByLineId(line.id).length;

  confirmModal.visible = true;
  confirmModal.target = "line";
  confirmModal.id = line.id;
  confirmModal.title = `Xóa line ${line.lineName}?`;
  confirmModal.message =
    machineCount > 0
      ? `Line này đang có ${machineCount} machine. Nếu backend không cho xóa line đang có machine, bạn cần xóa hoặc chuyển machine sang line khác trước.`
      : "Bạn có chắc chắn muốn xóa line này không?";
}

function askDeleteMachine(machine: Machine) {
  if (submitting.value) return;

  confirmModal.visible = true;
  confirmModal.target = "machine";
  confirmModal.id = machine.id;
  confirmModal.title = `Xóa machine ${machine.machineName}?`;
  confirmModal.message = "Bạn có chắc chắn muốn xóa machine này không?";
}

function resetConfirmModal() {
  confirmModal.target = null;
  confirmModal.id = null;
  confirmModal.title = "";
  confirmModal.message = "";
}

function closeConfirmModal(force = false) {
  if (submitting.value && !force) return;

  confirmModal.visible = false;
  resetConfirmModal();
}

async function submitConfirmDelete() {
  if (!confirmModal.target || !confirmModal.id || submitting.value) return;

  submitting.value = true;

  const target = confirmModal.target;
  const id = confirmModal.id;

  try {
    if (target === "line") {
      await store.deleteLine(id);
    }

    if (target === "machine") {
      await store.deleteMachine(id);
    }

    await refreshAfterMutation();

    closeConfirmModal(true);
    showToast(
      "success",
      target === "line" ? "Xóa line thành công" : "Xóa machine thành công",
      target === "line"
        ? `Đã xóa line ID ${id}.`
        : `Đã xóa machine ID ${id}.`,
    );
  } catch (error) {
    showToast(
      "error",
      target === "line" ? "Xóa line thất bại" : "Xóa machine thất bại",
      getErrorMessage(error, "Không thể xóa dữ liệu. Vui lòng thử lại."),
    );
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped src="./css/LineMachineView.css"></style>
