export interface BoardSpecs {
  length: number;
  width: number;
  thickness: number;
  noseWidth: number;
  tailWidth: number;
  color: string;
  texture: string;
  fins: {
    center: boolean;
    side: boolean;
    thruster: boolean;
  };
  volume: string;
}

export interface ReconfigureBoardRequest {
  initialSpecs: {
    boardLength: number;
    boardWidth: number;
    boardThickness: number;
    boardType: string;
  };
  additionalInfo: {
    preference: string;
  };
}

export interface ReconfigureBoardResponse {
  boardLength?: number;
  boardWidth?: number;
  boardThickness?: number;
  boardNoseWidth?: number;
  boardTailWidth?: number;
  boardVolume?: number;
}
