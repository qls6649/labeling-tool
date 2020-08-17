import { parseTransform } from "../util/common";

const VIEW_IMAGE = "annotator/VIEW_IMAGE" as const;
const CHANGE_MODE = "annotator/CHANGE_MODE" as const;
const SELECT_LABELS = "annotator/SELECT_LABELS" as const;
const CREATE_LABELS = "annotator/CREATE_LABELS" as const;
const UPDATE_LABELS = "annotator/UPDATE_LABELS" as const;
const UPDATE_IMG_LABELS = "annotator/UPDATE_IMG_LABELS" as const;
const DELETE_LABELS = "annotator/DELETE_LABELS" as const;

export const LABEL_SELECT_MODE = "LABEL_SELECT_MODE" as const;
export const LABEL_CREATE_MODE = "LABEL_CREATE_MODE" as const;

export const viewImage = (url: string, title: string) => ({ type: VIEW_IMAGE, url, title });
export const changeMode = (mode: string) => ({ type: CHANGE_MODE, mode });
export const selectLabels = (selectedLabelsIds: number[]) => ({ type: SELECT_LABELS, selectedLabelsIds });
export const createLabels = (labels: Array<SVGGElement>) => ({ type: CREATE_LABELS, labels });
export const updateLabels = (labels: Array<SVGGElement>, selectedLabelsIds: number[]) => ({
  type: UPDATE_LABELS,
  labels,
  selectedLabelsIds,
});
export const updateImgLabels = (image: SVGImageElement, labels: Array<SVGGElement>, selectedLabelsIds: number[]) => ({
  type: UPDATE_IMG_LABELS,
  image,
  labels,
  selectedLabelsIds,
});
export const deleteLabels = (selectedLabelsIds: number[]) => ({ type: DELETE_LABELS, selectedLabelsIds });

export type AnnotatorAction =
  | ReturnType<typeof viewImage>
  | ReturnType<typeof changeMode>
  | ReturnType<typeof selectLabels>
  | ReturnType<typeof createLabels>
  | ReturnType<typeof updateLabels>
  | ReturnType<typeof updateImgLabels>
  | ReturnType<typeof deleteLabels>;

export interface Labels {
  currentImgURL: {
    id: number;
    name: string;
    coordinates: Array<{ x: number; y: number }>;
    data: { x: number; y: number; w: number; h: number; deg: number };
  };
}

export interface AnnotatorState {
  mode: string;
  currentImgURL: string;
  images: Images;
  labels: Labels;
  selectedLabelsIds: Array<number>;
}

export interface Data {
  x: number;
  y: number;
  scale: number;
  deg: number;
  rotX: number;
  rotY: number;
  w: number;
  h: number;
}

export interface Images {
  currentImgURL: {
    title: string;
    x: number;
    y: number;
    scale: number;
  };
}

const initialState: AnnotatorState = {
  mode: LABEL_SELECT_MODE as string,
  currentImgURL: "" as string,
  images: {} as Images,
  labels: {} as Labels,
  selectedLabelsIds: [] as Array<number>,
};

export default function annotator(state: AnnotatorState = initialState, action: AnnotatorAction) {
  let _images: Images;
  let _labels: Labels;
  let _title: string;
  let _id: number;
  let _name: string;
  let tf: Data;
  let _data;
  let _coordinates;
  let updatedLabels;

  switch (action.type) {
    case VIEW_IMAGE:
      if (state.images[action.url]) {
        _images = { ...state.images };
      } else {
        _images = { ...state.images, [action.url]: { title: action.title, x: 0, y: 0, scale: 1 } };
      }

      return {
        ...state,
        mode: LABEL_SELECT_MODE,
        images: _images,
        currentImgURL: action.url,
        selectedLabelsIds: [],
      };
    case CHANGE_MODE:
      let newState = { ...state, mode: action.mode };

      if (state.selectedLabelsIds.length !== 0) {
        newState = { ...newState, selectedLabelsIds: [] };
      }
      return newState;
    case SELECT_LABELS:
      return {
        ...state,
        selectedLabelsIds: action.selectedLabelsIds,
      };
    case CREATE_LABELS:
      // 최초 생성시 초기화
      const preLabels = state.labels[state.currentImgURL] === undefined ? [] : [...state.labels[state.currentImgURL]];

      for (const label of action.labels) {
        _id = Number(label.dataset.id);
        _name = label.dataset.name as string;

        tf = parseTransform(label) as Data;

        _data = { x: tf.x, y: tf.y, w: tf.w, h: tf.h, deg: tf.deg };

        // coordinates
        // 0 1
        // 3 2
        _coordinates = [];
        _coordinates.push({ x: tf.x, y: tf.y });
        _coordinates.push({ x: tf.x + tf.w, y: tf.y });
        _coordinates.push({ x: tf.x + tf.w, y: tf.y + tf.h });
        _coordinates.push({ x: tf.x, y: tf.y + tf.h });

        preLabels.push({ id: _id, name: _name, coordinates: _coordinates, data: _data });
      }

      _labels = { ...state.labels, [state.currentImgURL]: preLabels };

      return {
        ...state,
        labels: _labels,
      };
    case UPDATE_LABELS:
      _labels = { ...state.labels };
      updatedLabels = [];

      for (const label of action.labels) {
        updatedLabels.push(getLabelState(label));
      }

      _labels[state.currentImgURL] = updatedLabels;

      return {
        ...state,
        labels: _labels,
        selectedLabelsIds: action.selectedLabelsIds,
      };
    case UPDATE_IMG_LABELS:
      _title = state.images[state.currentImgURL].title;
      tf = parseTransform(action.image) as Data;
      _images = { ...state.images, [state.currentImgURL]: { title: _title, x: tf.x, y: tf.y, scale: tf.scale } };

      updatedLabels = [];

      for (const label of action.labels) {
        updatedLabels.push(getLabelState(label));
      }

      _labels = { ...state.labels };
      _labels[state.currentImgURL] = updatedLabels;

      return {
        ...state,
        images: _images,
        labels: _labels,
        selectedLabelsIds: action.selectedLabelsIds,
      };
    case DELETE_LABELS:
      _labels = { ...state.labels };
      const _curImgLabels = [..._labels[state.currentImgURL]];

      for (const id of action.selectedLabelsIds) {
        const idx = _curImgLabels.findIndex((_label) => Number(_label.id) === Number(id));
        if (idx === -1) {
          continue;
        }
        _curImgLabels.splice(idx, 1);
      }

      _labels[state.currentImgURL] = _curImgLabels;

      return {
        ...state,
        labels: _labels,
        selectedLabelsIds: [],
      };
    default:
      return state;
  }
}

const getLabelState = (label: SVGGElement) => {
  const id = Number(label.dataset.id);
  const name = label.dataset.name;
  const tf = parseTransform(label) as Data;
  const data = { x: tf.x, y: tf.y, w: tf.w, h: tf.h, deg: tf.deg };

  const theta = (Math.PI / 180) * tf.deg;
  const cos_t = Math.cos(theta);
  const sin_t = Math.sin(theta);

  const c_x = tf.x + tf.rotX;
  const c_y = tf.y + tf.rotY;

  const nw_x = tf.x;
  const nw_y = tf.y;
  const ne_x = tf.x + tf.w;
  const ne_y = tf.y;
  const se_x = tf.x + tf.w;
  const se_y = tf.y + tf.h;
  const sw_x = tf.x;
  const sw_y = tf.y + tf.h;

  let nw_xp = (nw_x - c_x) * cos_t - (nw_y - c_y) * sin_t + c_x;
  let nw_yp = (nw_x - c_x) * sin_t + (nw_y - c_y) * cos_t + c_y;
  let ne_xp = (ne_x - c_x) * cos_t - (ne_y - c_y) * sin_t + c_x;
  let ne_yp = (ne_x - c_x) * sin_t + (ne_y - c_y) * cos_t + c_y;
  let se_xp = (se_x - c_x) * cos_t - (se_y - c_y) * sin_t + c_x;
  let se_yp = (se_x - c_x) * sin_t + (se_y - c_y) * cos_t + c_y;
  let sw_xp = (sw_x - c_x) * cos_t - (sw_y - c_y) * sin_t + c_x;
  let sw_yp = (sw_x - c_x) * sin_t + (sw_y - c_y) * cos_t + c_y;

  nw_xp = parseFloat(nw_xp.toFixed(2));
  nw_yp = parseFloat(nw_yp.toFixed(2));
  ne_xp = parseFloat(ne_xp.toFixed(2));
  ne_yp = parseFloat(ne_yp.toFixed(2));
  se_xp = parseFloat(se_xp.toFixed(2));
  se_yp = parseFloat(se_yp.toFixed(2));
  sw_xp = parseFloat(sw_xp.toFixed(2));
  sw_yp = parseFloat(sw_yp.toFixed(2));

  // coordinates
  // 0 1
  // 3 2
  const coordinates = [];
  coordinates.push({ x: nw_xp, y: nw_yp });
  coordinates.push({ x: ne_xp, y: ne_yp });
  coordinates.push({ x: se_xp, y: se_yp });
  coordinates.push({ x: sw_xp, y: sw_yp });

  return { id: id, name: name, coordinates: coordinates, data: data };
};