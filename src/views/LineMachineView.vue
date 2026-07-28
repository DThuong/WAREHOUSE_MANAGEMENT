<template>
  <Toast position="top-right" />

  <MainLayout>
    <div class="page-gradient-bg">
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
                {{ t("lineMachine.title") }}
              </h1>

              <p class="mt-1 text-sm text-slate-500">
                {{ t("lineMachine.subtitle") }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="store.loading"
                @click="openCreateLineModal"
              >
                {{ t("lineMachine.addLine") }}
              </button>

              <button
                type="button"
                class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="store.loading || store.lines.length === 0"
                @click="openCreateMachineModal()"
              >
                {{ t("lineMachine.addMachine") }}
              </button>

              <button
                type="button"
                class="col-span-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1"
                :disabled="store.loading || store.lines.length < 2"
                @click="openCopyMachinesModal()"
              >
                {{ t("lineMachine.copyMachine") }}
              </button>
            </div>
          </div>

          <!-- STATS -->
          <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div class="rounded-2xl bg-slate-50 p-4">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                {{ t("lineMachine.totalLine") }}
              </p>
              <p class="mt-1 text-2xl font-bold text-slate-900">
                {{ store.lines.length }}
              </p>
            </div>

            <div class="rounded-2xl bg-slate-50 p-4">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                {{ t("lineMachine.totalMachine") }}
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
                {{ t("lineMachine.search") }}
              </label>

              <input
                v-model.trim="searchText"
                type="text"
                :placeholder="t('lineMachine.searchPlaceholder')"
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                {{ t("lineMachine.area") }}
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
                  {{ t("lineMachine.all") }}
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
            {{ t("lineMachine.loading") }}
          </p>
        </div>

        <!-- EMPTY -->
        <div
          v-else-if="filteredLines.length === 0"
          class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm"
        >
          <p class="text-base font-semibold text-slate-800">
            {{ t("lineMachine.noData") }}
          </p>

          <p class="mt-1 text-sm text-slate-500">
            {{ t("lineMachine.noDataHint") }}
          </p>

          <button
            type="button"
            class="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
            @click="openCreateLineModal"
          >
            {{ t("lineMachine.addLine") }}
          </button>
        </div>

        <!-- LINE LIST -->
        <section v-else class="space-y-4">
          <div
            class="lm-line-toolbar rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <p class="text-base font-bold text-slate-900">{{ t("lineMachine.lineListTitle") }}</p>
              <p class="mt-1 text-sm text-slate-500">
                {{ t("lineMachine.lineListHint", { count: filteredLines.length }) }}
              </p>
            </div>

            <div class="lm-line-toolbar-actions">
              <button
                type="button"
                class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
                @click="expandAllLines"
              >
                {{ t("lineMachine.expandAll") }}
              </button>

              <button
                type="button"
                class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
                @click="collapseAllLines"
              >
                {{ t("lineMachine.collapseAll") }}
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
                      class="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700"
                    >
                      {{ t("lineMachine.machineCount", { count: getMachinesByLineId(line.id).length }) }}
                    </span>

                    <button
                      v-if="getMachinesByLineId(line.id).length > 0"
                      type="button"
                      class="rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 text-xs font-bold transition active:scale-95 flex items-center gap-1 border border-blue-200 ml-2"
                      @click.stop="openLineAnalyticsModal(line)"
                    >
                      <i class="pi pi-eye text-[10px]"></i>
                      {{ t("lineMachine.viewDetailsShort") || 'Xem chi tiết' }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4" @click.stop>
                <button
                  type="button"
                  class="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
                  @click="openCreateMachineModal(line.id)"
                >
                  {{ t("lineMachine.addMachineShort") }}
                </button>

                <button
                  type="button"
                  class="rounded-xl bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="store.lines.length < 2"
                  @click="openCopyMachinesModal(line.id)"
                >
                  {{ t("lineMachine.copy") }}
                </button>

                <button
                  type="button"
                  class="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-95"
                  @click="openEditLineModal(line)"
                >
                  {{ t("lineMachine.edit") }}
                </button>

                <button
                  type="button"
                  class="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 active:scale-95"
                  @click="askDeleteLine(line)"
                >
                  {{ t("lineMachine.delete") }}
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
                            {{ t("lineMachine.table.machineName") }}
                          </th>

                          <th
                            class="w-37.5 px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                          >
                            Line ID
                          </th>

                          <th
                            class="w-55 px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500"
                          >
                            {{ t("lineMachine.table.actions") }}
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
                            {{ t("lineMachine.table.noMachines") }}
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
                                class="inline-flex items-center justify-center rounded-lg bg-blue-50 px-2.5 py-2 text-blue-700 transition hover:bg-blue-100 active:scale-95"
                                :title="t('lineMachine.analytics.button')"
                                :aria-label="t('lineMachine.analytics.button')"
                                @click="openAnalyticsModal(machine)"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  class="h-4 w-4"
                                >
                                  <path d="M3 3v18h18" />
                                  <path d="M7 16v-4" />
                                  <path d="M12 16V8" />
                                  <path d="M17 16v-7" />
                                </svg>
                              </button>

                              <button
                                type="button"
                                class="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 active:scale-95"
                                @click="openEditMachineModal(machine)"
                              >
                                {{ t("lineMachine.edit") }}
                              </button>

                              <button
                                type="button"
                                class="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 active:scale-95"
                                @click="askDeleteMachine(machine)"
                              >
                                {{ t("lineMachine.delete") }}
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
                      {{ t("lineMachine.table.noMachines") }}
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
                            class="inline-flex items-center justify-center rounded-lg bg-blue-100 px-2.5 py-2 text-blue-700 active:scale-95"
                            :title="t('lineMachine.analytics.button')"
                            :aria-label="t('lineMachine.analytics.button')"
                            @click="openAnalyticsModal(machine)"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="h-4 w-4"
                            >
                              <path d="M3 3v18h18" />
                              <path d="M7 16v-4" />
                              <path d="M12 16V8" />
                              <path d="M17 16v-7" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            class="rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700 active:scale-95"
                            @click="openEditMachineModal(machine)"
                          >
                            {{ t("lineMachine.edit") }}
                          </button>

                          <button
                            type="button"
                            class="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 active:scale-95"
                            @click="askDeleteMachine(machine)"
                          >
                            {{ t("lineMachine.delete") }}
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
              {{ lineModal.mode === "create" ? t("lineMachine.modal.addLine") : t("lineMachine.modal.editLine") }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              {{
                lineModal.mode === "create"
                  ? t("lineMachine.modal.addLineHint")
                  : t("lineMachine.modal.editLineHint")
              }}
            </p>
          </div>

          <button
            type="button"
            class="lm-modal-close"
            :aria-label="t('lineMachine.modal.close')"
            @click="closeLineModal"
          >
            ✕
          </button>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="submitLineForm">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              {{ t("lineMachine.modal.lineName") }}
            </label>

            <input
              v-model.trim="lineForm.lineName"
              type="text"
              :placeholder="t('lineMachine.modal.lineNamePlaceholder')"
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              {{ t("lineMachine.modal.area") }}
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
              {{ t("lineMachine.modal.cancel") }}
            </button>

            <button
              type="submit"
              class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="submitting"
            >
              {{ submitting ? t("lineMachine.modal.saving") : t("lineMachine.modal.save") }}
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
                machineModal.mode === "create" ? t("lineMachine.modal.addMachine") : t("lineMachine.modal.editMachine")
              }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              {{ t("lineMachine.modal.machineHint") }}
            </p>
          </div>

          <button
            type="button"
            class="lm-modal-close"
            :aria-label="t('lineMachine.modal.close')"
            @click="closeMachineModal"
          >
            ✕
          </button>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="submitMachineForm">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              {{ t("lineMachine.modal.machineName") }}
            </label>

            <input
              v-model.trim="machineForm.machineName"
              type="text"
              :placeholder="t('lineMachine.modal.machineNamePlaceholder')"
              class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              {{ t("lineMachine.modal.belongsToLine") }}
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
              {{ t("lineMachine.modal.cancel") }}
            </button>

            <button
              type="submit"
              class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="submitting"
            >
              {{ submitting ? t("lineMachine.modal.saving") : t("lineMachine.modal.save") }}
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
              {{ t("lineMachine.copyModal.title") }}
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              {{ t("lineMachine.copyModal.hint") }}
            </p>
          </div>

          <button
            type="button"
            class="lm-modal-close"
            :aria-label="t('lineMachine.modal.close')"
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
                  {{ t("lineMachine.copyModal.sourceLine") }}
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
                    {{ t("lineMachine.copyModal.machinesSuffix") }}
                  </option>
                </select>

                <p class="mt-2 text-xs font-medium text-slate-500">
                  {{ t("lineMachine.copyModal.selecting") }}
                  <span class="font-bold text-slate-700">
                    {{ selectedSourceLineLabel }}
                  </span>
                  · {{ selectedSourceMachines.length }} {{ t("lineMachine.copyModal.machineUnit") }}
                </p>
              </div>

              <div
                v-if="selectedSourceMachines.length"
                class="lm-copy-box"
              >
                <div class="lm-copy-section-title">
                  <p>{{ t("lineMachine.copyModal.copyListTitle") }}</p>
                  <span>{{ t("lineMachine.machineCount", { count: selectedSourceMachines.length }) }}</span>
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
                {{ t("lineMachine.copyModal.noSourceMachines") }}
              </div>

              <div class="lm-copy-summary">
                <p class="font-bold">{{ t("lineMachine.copyModal.summary") }}</p>
                <p class="mt-1">
                  {{ t("lineMachine.copyModal.copyFrom") }}
                  <span class="font-bold">{{ selectedSourceLineLabel }}</span>
                  {{ t("lineMachine.copyModal.to") }}
                  <span class="font-bold">
                    {{ copyMachinesForm.targetLineIds.length }}
                  </span>
                  {{ t("lineMachine.copyModal.targetLinesSuffix") }}
                </p>
                <p>
                  {{ t("lineMachine.copyModal.newMachinesEstimate") }}
                  <span class="font-bold">{{ totalCopyAddCount }}</span>.
                </p>
              </div>
            </section>

            <section class="lm-copy-panel">
              <div class="lm-copy-target-head">
                <div>
                  <label class="block text-sm font-semibold text-slate-700">
                    {{ t("lineMachine.copyModal.targetLine") }}
                  </label>
                  <p class="mt-1 text-xs font-medium text-slate-500">
                    {{ t("lineMachine.copyModal.targetLineHint") }}
                  </p>
                </div>

                <div class="lm-copy-target-actions">
                  <button
                    type="button"
                    class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95"
                    @click="selectAllCopyTargets"
                  >
                    {{ t("lineMachine.copyModal.selectAll") }}
                  </button>

                  <button
                    type="button"
                    class="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 active:scale-95"
                    @click="clearCopyTargets"
                  >
                    {{ t("lineMachine.copyModal.clearSelection") }}
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
                      {{ t("lineMachine.copyModal.targetLineInfo", {
                        area: line.areaPart,
                        current: getMachinesByLineId(line.id).length,
                        add: getCopyAddCount(line.id)
                      }) }}
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
              {{ t("lineMachine.modal.cancel") }}
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
              {{ submitting ? t("lineMachine.copyModal.copying") : t("lineMachine.copyModal.copyAction") }}
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
            {{ t("lineMachine.confirmModal.cancel") }}
          </button>

          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="submitting"
            @click="submitConfirmDelete"
          >
            {{ submitting ? t("lineMachine.confirmModal.deleting") : t("lineMachine.confirmModal.delete") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ANALYTICS MODAL -->
  <Teleport to="body">
    <div
      v-if="analyticsModal.visible"
      class="lm-modal-overlay"
      @click.self="closeAnalyticsModal"
    >
      <div class="lm-modal-card lm-modal-card-wide lm-modal-card-xwide flex flex-col">
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-2 md:flex-row md:items-start md:gap-6 min-w-0">
            <div>
              <h3 class="text-lg font-bold text-slate-900">
                {{ t("lineMachine.analytics.title") }}
              </h3>
              <p class="mt-0.5 text-xs text-slate-500">
                {{ analyticsModal.line ? `Line: ${analyticsModal.line.lineName} (${analyticsModal.line.areaPart})` : '' }}
              </p>
            </div>

            <!-- Machine Selector Dropdown -->
            <div v-if="analyticsModal.line" class="flex flex-wrap items-center gap-3">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wide">Machine:</label>
              <Dropdown
                v-model="selectedAnalyticsMachineId"
                :options="analyticsDropdownOptions"
                optionLabel="label"
                optionValue="value"
                class="min-w-64 select-custom-dropdown"
                panelClass="select-custom-dropdown-panel"
                appendTo="body"
                @change="onAnalyticsMachineChange"
              >
                <template #value="slotProps">
                  <div v-if="slotProps.value" class="flex items-center gap-2 py-0.5">
                    <span class="font-bold text-slate-800 text-sm">{{ getSelectedMachineLabel(slotProps.value) }}</span>
                  </div>
                  <span v-else class="text-slate-400 text-sm">{{ slotProps.placeholder || 'Chọn máy...' }}</span>
                </template>
                <template #option="slotProps">
                  <div class="flex items-center justify-between w-full py-1.5 px-1">
                    <span 
                      class="font-semibold text-sm"
                      :class="slotProps.option.count > 0 ? 'text-slate-900' : 'text-slate-500'"
                    >
                      {{ slotProps.option.machineName }}
                    </span>
                    <span 
                      class="text-xs px-2.5 py-1 rounded-full font-bold border whitespace-nowrap ml-4"
                      :class="slotProps.option.count > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'"
                    >
                      {{ slotProps.option.count }} loại VT
                    </span>
                  </div>
                </template>
              </Dropdown>
              <span v-if="loadingCounts" class="text-xs text-slate-400 animate-pulse flex items-center gap-1.5 ml-2">
                <span class="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></span>
                Đang quét...
              </span>
            </div>
            <div v-else>
              <p class="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                {{ analyticsModal.machine?.machineName }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="lm-modal-close"
            :aria-label="t('lineMachine.modal.close')"
            @click="closeAnalyticsModal"
          >
            ✕
          </button>
        </div>

        <!-- DATE FILTER -->
        <div class="mt-4 grid grid-cols-2 gap-3 sm:flex sm:items-end sm:gap-3">
          <div class="sm:w-44">
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              {{ t("lineMachine.analytics.fromDate") }}
            </label>
            <input
              v-model="analyticsFilter.fromDate"
              type="date"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div class="sm:w-44">
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              {{ t("lineMachine.analytics.toDate") }}
            </label>
            <input
              v-model="analyticsFilter.toDate"
              type="date"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div class="col-span-2 flex gap-2 sm:col-span-1">
            <button
              type="button"
              class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="analyticsModal.loading"
              @click="fetchMachineUsage"
            >
              {{ t("lineMachine.analytics.apply") }}
            </button>

            <button
              type="button"
              class="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="analyticsModal.loading"
              @click="resetAnalyticsFilter"
            >
              {{ t("lineMachine.analytics.reset") }}
            </button>
          </div>
        </div>

        <!-- SUMMARY -->
        <div
          v-if="!analyticsModal.loading && analyticsModal.data.length > 0"
          class="mt-3 flex flex-wrap gap-2"
        >
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {{ t("lineMachine.analytics.totalItems", { count: analyticsModal.data.length }) }}
          </span>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {{ t("lineMachine.analytics.totalUsed", { count: analyticsUsageTotal }) }}
          </span>
        </div>

        <!-- TABLE -->
        <div class="lm-machine-scroll mt-3 flex-1 rounded-xl border border-slate-200">
          <table class="w-full table-fixed">
            <thead class="lm-sticky-head bg-slate-50">
              <tr>
                <th class="w-1/3 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  {{ t("lineMachine.analytics.colName") }}
                </th>
                <th class="w-1/6 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  {{ t("lineMachine.analytics.colArea") }}
                </th>
                <th class="w-1/6 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  {{ t("lineMachine.analytics.colStock") }}
                </th>
                <th class="w-1/6 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  {{ t("lineMachine.analytics.colUsed") }}
                </th>
                <th class="w-1/6 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  {{ t("lineMachine.analytics.colOrderCount") }}
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="analyticsModal.loading">
                <td colspan="5" class="px-4 py-10 text-center text-sm text-slate-500">
                  {{ t("lineMachine.analytics.loading") }}
                </td>
              </tr>

              <tr v-else-if="analyticsModal.error">
                <td colspan="5" class="px-4 py-10 text-center text-sm text-red-600">
                  {{ analyticsModal.error }}
                </td>
              </tr>

              <tr v-else-if="analyticsModal.data.length === 0">
                <td colspan="5" class="px-4 py-10 text-center text-sm text-slate-500">
                  {{ t("lineMachine.analytics.empty") }}
                </td>
              </tr>

              <tr
                v-for="row in analyticsModal.data"
                v-else
                :key="row.itemId"
                class="border-t border-slate-100 transition hover:bg-slate-50"
              >
                <td class="px-4 py-3 text-sm text-slate-900">
                  <p class="truncate font-semibold">{{ getUsageItemName(row) }}</p>
                  <p class="text-xs text-slate-500">{{ row.unit }}</p>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">
                  {{ row.areaPart }}
                </td>
                <td class="px-4 py-3 text-right text-sm text-slate-600">
                  {{ row.item?.stockQty?.toLocaleString("vi-VN") ?? "-" }}
                </td>
                <td class="px-4 py-3 text-right text-sm font-bold text-blue-700">
                  {{ row.totalOrdered.toLocaleString("vi-VN") }}
                </td>
                <td class="px-4 py-3 text-right text-sm text-slate-600">
                  {{ row.orderCount.toLocaleString("vi-VN") }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import MainLayout from "@/components/MainLayout.vue";
import Toast from "primevue/toast";
import Dropdown from "primevue/dropdown";
import { useToast } from "primevue/usetoast";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useLineMachineStore } from "@/stores/line_machine";
import type { Line, Machine } from "@/types/line_machine.types";
import { itemAPI } from "@/services/itemAPI";
import type { MachineUsageItem } from "@/types/item.types";

const { t } = useI18n();

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

const analyticsModal = reactive<{
  visible: boolean;
  machine: Machine | null;
  line: Line | null;
  loading: boolean;
  error: string;
  data: MachineUsageItem[];
}>({
  visible: false,
  machine: null,
  line: null,
  loading: false,
  error: "",
  data: [],
});

const selectedAnalyticsMachineId = ref<number | null>(null);
const loadingCounts = ref(false);
const machineCounts = ref<Record<number, number>>({});

const analyticsDropdownOptions = computed(() => {
  if (!analyticsModal.line) return [];
  const machines = getMachinesByLineId(analyticsModal.line.id);
  return machines.map(m => ({
    label: m.machineName,
    machineName: m.machineName,
    count: machineCounts.value[m.id] || 0,
    value: m.id
  }));
});

function getSelectedMachineLabel(id: number) {
  const m = store.machines.find(x => x.id === id);
  if (!m) return '';
  const count = machineCounts.value[id] || 0;
  return `${m.machineName} (${count} loại VT)`;
}

const fetchLineMachineCounts = async (lineId: number) => {
  loadingCounts.value = true;
  const machines = getMachinesByLineId(lineId);
  
  // Initialize counts
  machines.forEach(m => {
    machineCounts.value[m.id] = 0;
  });
  
  try {
    await Promise.all(machines.map(async (m) => {
      try {
        const data = await itemAPI.getByMachine(m.id);
        machineCounts.value[m.id] = data.length;
      } catch (err) {
        console.error(`Failed to fetch count for machine ${m.id}`, err);
        machineCounts.value[m.id] = 0;
      }
    }));
  } finally {
    loadingCounts.value = false;
  }
};

const analyticsFilter = reactive<{
  fromDate: string;
  toDate: string;
}>({
  fromDate: "",
  toDate: "",
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

const isAnyModalVisible = computed(() => {
  return (
    lineModal.visible ||
    machineModal.visible ||
    copyMachinesModal.visible ||
    analyticsModal.visible ||
    confirmModal.visible
  );
});

watch(isAnyModalVisible, (visible) => {
  if (visible) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
});

onUnmounted(() => {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
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
  if (!selectedSourceLine.value) return t("lineMachine.deleteConfirm.noSourceLine");

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
      t("lineMachine.toast.loadErrorTitle"),
      getErrorMessage(error, t("lineMachine.toast.loadErrorDetail")),
    );
  }
}

async function refreshAfterMutation() {
  try {
    await store.fetchInitialData();
  } catch (error) {
    showToast(
      "warn",
      t("lineMachine.toast.notRefreshedTitle"),
      getErrorMessage(error, t("lineMachine.toast.notRefreshedDetail")),
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

const analyticsUsageTotal = computed(() => {
  return analyticsModal.data.reduce((sum, row) => sum + (row.totalOrdered || 0), 0);
});

function getUsageItemName(row: MachineUsageItem) {
  return row.item?.eng?.partname || row.item?.com?.name || row.itemIndentifyId;
}

function openAnalyticsModal(machine: Machine) {
  const line = store.lines.find(l => l.id === machine.lineId) || null;
  analyticsModal.visible = true;
  analyticsModal.machine = machine;
  analyticsModal.line = line;
  analyticsModal.data = [];
  analyticsModal.error = "";
  analyticsFilter.fromDate = "";
  analyticsFilter.toDate = "";
  selectedAnalyticsMachineId.value = machine.id;

  if (line) {
    void fetchLineMachineCounts(line.id);
  }
  void fetchMachineUsage();
}

function openLineAnalyticsModal(line: Line) {
  const machines = getMachinesByLineId(line.id);
  if (machines.length === 0) {
    showToast("warn", t("common.warn") || "Cảnh báo", "Line này chưa có máy nào");
    return;
  }
  
  analyticsModal.visible = true;
  analyticsModal.line = line;
  analyticsModal.machine = machines[0];
  analyticsModal.data = [];
  analyticsModal.error = "";
  analyticsFilter.fromDate = "";
  analyticsFilter.toDate = "";
  selectedAnalyticsMachineId.value = machines[0].id;
  
  void fetchLineMachineCounts(line.id);
  void fetchMachineUsage();
}

function onAnalyticsMachineChange() {
  if (!selectedAnalyticsMachineId.value) return;
  const machines = getMachinesByLineId(analyticsModal.line?.id || 0);
  const found = machines.find(m => m.id === selectedAnalyticsMachineId.value);
  if (found) {
    analyticsModal.machine = found;
    void fetchMachineUsage();
  }
}

function closeAnalyticsModal() {
  analyticsModal.visible = false;
  analyticsModal.machine = null;
  analyticsModal.line = null;
  analyticsModal.data = [];
  analyticsModal.error = "";
  machineCounts.value = {};
}

function resetAnalyticsFilter() {
  analyticsFilter.fromDate = "";
  analyticsFilter.toDate = "";
  void fetchMachineUsage();
}

async function fetchMachineUsage() {
  if (!analyticsModal.machine?.id) return;

  analyticsModal.loading = true;
  analyticsModal.error = "";

  try {
    analyticsModal.data = await itemAPI.getByMachine(
      analyticsModal.machine.id,
      analyticsFilter.fromDate || undefined,
      analyticsFilter.toDate || undefined,
    );
  } catch (error) {
    analyticsModal.data = [];
    const rawError = getErrorMessage(error, "");
    if (rawError.includes("No items found") || rawError.includes("not found")) {
      analyticsModal.error = "";
    } else {
      analyticsModal.error = rawError || t("lineMachine.analytics.loadError");
    }
  } finally {
    analyticsModal.loading = false;
  }
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
    showToast("warn", t("lineMachine.toast.missingInfoTitle"), t("lineMachine.toast.missingLineName"));
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
        showToast("error", t("lineMachine.toast.missingLineIdTitle"), t("lineMachine.toast.missingLineIdDetail"));
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
      isCreate ? t("lineMachine.toast.addLineSuccessTitle") : t("lineMachine.toast.updateLineSuccessTitle"),
      isCreate
        ? t("lineMachine.toast.addLineSuccessDetail", { name: lineName })
        : t("lineMachine.toast.updateLineSuccessDetail", { name: lineName }),
    );
  } catch (error) {
    showToast(
      "error",
      isCreate ? t("lineMachine.toast.addLineFailTitle") : t("lineMachine.toast.updateLineFailTitle"),
      getErrorMessage(error, t("lineMachine.toast.checkInfoRetry")),
    );
  } finally {
    submitting.value = false;
  }
}

function openCreateMachineModal(defaultLineId?: number) {
  if (submitting.value) return;

  if (!store.lines.length) {
    showToast("warn", t("lineMachine.toast.noLineTitle"), t("lineMachine.toast.noLineDetail"));
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
    showToast("warn", t("lineMachine.toast.missingInfoTitle"), t("lineMachine.toast.missingMachineName"));
    return;
  }

  if (!machineForm.lineId) {
    showToast("warn", t("lineMachine.toast.missingInfoTitle"), t("lineMachine.toast.missingLineSelect"));
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
          t("lineMachine.toast.missingMachineIdTitle"),
          t("lineMachine.toast.missingMachineIdDetail"),
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
      isCreate ? t("lineMachine.toast.addMachineSuccessTitle") : t("lineMachine.toast.updateMachineSuccessTitle"),
      isCreate
        ? t("lineMachine.toast.addMachineSuccessDetail", { name: machineName })
        : t("lineMachine.toast.updateMachineSuccessDetail", { name: machineName }),
    );
  } catch (error) {
    showToast(
      "error",
      isCreate ? t("lineMachine.toast.addMachineFailTitle") : t("lineMachine.toast.updateMachineFailTitle"),
      getErrorMessage(error, t("lineMachine.toast.checkInfoRetry")),
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
      t("lineMachine.toast.notEnoughLinesTitle"),
      t("lineMachine.toast.notEnoughLinesDetail"),
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
    showToast("warn", t("lineMachine.toast.noSourceLineTitle"), t("lineMachine.toast.noSourceLineDetail"));
    return;
  }

  if (!selectedSourceMachines.value.length) {
    showToast(
      "warn",
      t("lineMachine.toast.sourceNoMachinesTitle"),
      t("lineMachine.toast.sourceNoMachinesDetail"),
    );
    return;
  }

  if (!copyMachinesForm.targetLineIds.length) {
    showToast("warn", t("lineMachine.toast.noTargetLineTitle"), t("lineMachine.toast.noTargetLineDetail"));
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
      t("lineMachine.toast.noNewMachinesTitle"),
      t("lineMachine.toast.noNewMachinesDetail"),
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
      t("lineMachine.toast.copySuccessTitle"),
      t("lineMachine.toast.copySuccessDetail", { count: successCount, line: selectedSourceLineLabel.value }),
    );
  } catch (error) {
    await refreshAfterMutation();

    showToast(
      "error",
      t("lineMachine.toast.copyIncompleteTitle"),
      t("lineMachine.toast.copyIncompleteDetail", {
        success: successCount,
        total: copyJobs.length,
        error: getErrorMessage(error, t("lineMachine.toast.checkInfoRetry")),
      }),
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
  confirmModal.title = t("lineMachine.deleteConfirm.confirmLineTitle", { name: line.lineName });
  confirmModal.message =
    machineCount > 0
      ? t("lineMachine.deleteConfirm.confirmLineWithMachines", { count: machineCount })
      : t("lineMachine.deleteConfirm.confirmLineNoMachines");
}

function askDeleteMachine(machine: Machine) {
  if (submitting.value) return;

  confirmModal.visible = true;
  confirmModal.target = "machine";
  confirmModal.id = machine.id;
  confirmModal.title = t("lineMachine.deleteConfirm.confirmMachineTitle", { name: machine.machineName });
  confirmModal.message = t("lineMachine.deleteConfirm.confirmMachineMessage");
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
      target === "line" ? t("lineMachine.toast.deleteLineSuccessTitle") : t("lineMachine.toast.deleteMachineSuccessTitle"),
      target === "line"
        ? t("lineMachine.toast.deleteLineSuccessDetail", { id })
        : t("lineMachine.toast.deleteMachineSuccessDetail", { id }),
    );
  } catch (error) {
    showToast(
      "error",
      target === "line" ? t("lineMachine.toast.deleteLineFailTitle") : t("lineMachine.toast.deleteMachineFailTitle"),
      getErrorMessage(error, t("lineMachine.toast.deleteFailDetail")),
    );
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped src="./css/LineMachineView.css"></style>

<style>
.select-custom-dropdown {
  border-radius: 12px !important;
  border-color: #cbd5e1 !important; /* border-slate-300 */
  box-shadow: none !important;
  transition: all 0.2s ease-in-out;
}
.select-custom-dropdown:hover {
  border-color: #94a3b8 !important; /* border-slate-400 */
}
.select-custom-dropdown.p-focus {
  border-color: #3b82f6 !important; /* border-blue-500 */
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
}
.select-custom-dropdown .p-dropdown-label,
.select-custom-dropdown .p-select-label {
  padding: 0.5rem 1rem !important;
}
.select-custom-dropdown .p-dropdown-trigger,
.select-custom-dropdown .p-select-dropdown {
  width: 2.5rem !important;
  color: #64748b !important;
}

/* Styling for dropdown options overlay */
.select-custom-dropdown-panel.p-dropdown-panel,
.select-custom-dropdown-panel.p-select-overlay {
  z-index: 110000 !important;
}
.p-dropdown-panel,
.p-select-overlay {
  border-radius: 12px !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #e2e8f0 !important;
  margin-top: 4px !important;
}
.p-dropdown-panel .p-dropdown-items,
.p-select-overlay .p-select-list {
  padding: 0.375rem !important;
}
.p-dropdown-panel .p-dropdown-item,
.p-select-overlay .p-select-option {
  margin: 2px 0 !important;
  padding: 0.5rem 0.75rem !important;
  border-radius: 8px !important;
  transition: background-color 0.15s ease-in-out;
}
.p-dropdown-panel .p-dropdown-item:not(.p-highlight):not(.p-disabled):hover,
.p-select-overlay .p-select-option:not(.p-select-option-selected):not(.p-disabled):hover {
  background-color: #f1f5f9 !important; /* bg-slate-100 */
}
.p-dropdown-panel .p-dropdown-item.p-highlight,
.p-select-overlay .p-select-option.p-select-option-selected {
  background-color: #eff6ff !important; /* bg-blue-50 */
  color: #1e40af !important; /* text-blue-800 */
}
</style>
