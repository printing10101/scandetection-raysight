// 底片观察器 store——从 bundle 的 defineStore("viewerFilms") 区块还原（7757–7862 行）。
// films：已导入底片（objectURL + 元数据），新片插到队首，超上限从队尾淘汰并回收 URL；
// annotations：报告标注框（imageW/imageH/reportId/boxes），按底片 id 存取；
// stamps：底片印字识别结果，按底片 id 存取。
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { isPreviewableImage } from '../utils/mediaFormats.js';

const MAX_FILMS = 120;
let nextFilmId = 1;

export const useViewerFilmsStore = defineStore('viewerFilms', () => {
  const films = ref([]);
  const lastAddedId = ref(-1);
  const annotations = ref({});
  const stamps = ref({});
  const count = computed(() => films.value.length);

  function findByNameAndSize(name, size) {
    return films.value.find((film) => film.name === name && film.size === size);
  }

  // 批量加入底片：同名同大小的已有片只切换选中，不重复建 URL。
  function add(files) {
    for (const file of files) {
      const existing = findByNameAndSize(file.name, file.size);
      if (existing) {
        lastAddedId.value = existing.id;
        continue;
      }
      const film = {
        id: nextFilmId++,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        decodable: isPreviewableImage(file.name),
        addedAt: Date.now(),
      };
      films.value.unshift(film);
      lastAddedId.value = film.id;
    }
    trimToLimit();
  }

  // 超上限时从队尾淘汰：回收 objectURL 并清掉附属的标注/印字。
  function trimToLimit() {
    while (films.value.length > MAX_FILMS) {
      const film = films.value.pop();
      if (film) {
        URL.revokeObjectURL(film.url);
        deleteAnnotations(film.id);
        deleteStamp(film.id);
      }
    }
  }

  function setAnnotations(id, value) {
    annotations.value = { ...annotations.value, [id]: value };
  }

  function annotationsOf(id) {
    return id == null ? null : annotations.value[id] ?? null;
  }

  function deleteAnnotations(id) {
    if (id in annotations.value) {
      const copy = { ...annotations.value };
      delete copy[id];
      annotations.value = copy;
    }
  }

  function setStamp(id, value) {
    stamps.value = { ...stamps.value, [id]: value };
  }

  function stampOf(id) {
    return id == null ? null : stamps.value[id] ?? null;
  }

  function deleteStamp(id) {
    if (id in stamps.value) {
      const copy = { ...stamps.value };
      delete copy[id];
      stamps.value = copy;
    }
  }

  function remove(id) {
    const index = films.value.findIndex((film) => film.id === id);
    if (index === -1) return;
    const [film] = films.value.splice(index, 1);
    URL.revokeObjectURL(film.url);
    deleteAnnotations(id);
    deleteStamp(id);
    if (lastAddedId.value === id) lastAddedId.value = -1;
  }

  function clear() {
    for (const film of films.value) URL.revokeObjectURL(film.url);
    films.value = [];
    annotations.value = {};
    stamps.value = {};
    lastAddedId.value = -1;
  }

  return {
    films,
    lastAddedId,
    count,
    annotations,
    stamps,
    add,
    setAnnotations,
    annotationsOf,
    setStamp,
    stampOf,
    remove,
    clear,
  };
});
