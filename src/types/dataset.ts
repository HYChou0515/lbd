// Dataset Type 定義（11 種類型）
export type DatasetType =
  | 'EBI'
  | 'Escan IDT'
  | 'Escan IDT Result'
  | 'PrimeV IDT'
  | 'PrimeV IDT Result'
  | 'GDS'
  | 'Review Ready'
  | 'RSEM'
  | 'RSEM Result'
  | 'Group'

export interface BaseInfo {
  name: string;
  description: string;
}

export interface BaseDataset {
  name: string;
  description: string;
  sub_dataset_revision_ids: string[];
}


export interface BasicDataset extends BaseDataset{
  toolId: string;      // 6-8 字
  waferId: string;       // 6-8 字
  lotId: string;      // 6-8 字
  part: string;      // 6-8 字
  recipe: string;    // 20-40 字
  stage: string;     // 20-40 字
}

export interface GroupDataset extends BaseDataset{
  type: 'Group';
}

export interface EBI extends BasicDataset {
    type : 'EBI';
}
export interface EscanIDT extends BasicDataset {
    type : 'Escan IDT';
}
export interface EscanIDTResult extends BasicDataset {
    type : 'Escan IDT Result';
    
}
export interface PrimeVIDT extends BasicDataset {
    type : 'PrimeV IDT';
}
export interface PrimeVIDTResult extends BasicDataset {
    type : 'PrimeV IDT Result';
}
export interface GDS extends BasicDataset {
    type : 'GDS';
    
}
export interface ReviewReady extends BasicDataset {
    type : 'Review Ready';

}
export interface RSEM extends BasicDataset {
    type : 'RSEM';

}
export interface RSEMResult extends BasicDataset {
    type : 'RSEM Result';
}

export type Dataset = (
  | EBI
  | EscanIDT
  | EscanIDTResult
  | PrimeVIDT
  | PrimeVIDTResult
  | GDS
  | ReviewReady
  | RSEM
  | RSEMResult
    | GroupDataset
)

export type MimicUnzippedShit = {
    filePath: string;
    content: string | ArrayBuffer;
}
