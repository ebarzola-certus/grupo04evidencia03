const DIFFICULTIES = {
  easy: {
    name: 'Fácil', color: '#1D9E75', cls: 'easy', perSpawn: 1, icon: '🌿',
    levels: [
      { time: 70, goal: 10, speed: 0.9, rate: 2200, label: 'Lluvia suave'   },
      { time: 70, goal: 14, speed: 1.1, rate: 2000, label: 'Brisa cósmica'  },
      { time: 65, goal: 18, speed: 1.3, rate: 1800, label: 'Tormenta leve'  },
      { time: 65, goal: 22, speed: 1.5, rate: 1600, label: 'Enjambre menor' },
      { time: 60, goal: 28, speed: 1.7, rate: 1400, label: 'Último asalto'  }
    ]
  },
  normal: {
    name: 'Normal', color: '#378ADD', cls: 'normal', perSpawn: 2, icon: '🌍',
    levels: [
      { time: 60, goal: 15, speed: 1.4, rate: 1800, label: 'Alerta cósmica'    },
      { time: 60, goal: 22, speed: 1.7, rate: 1500, label: 'Bombardeo doble'   },
      { time: 55, goal: 30, speed: 2.0, rate: 1300, label: 'Lluvia de fuego'   },
      { time: 55, goal: 38, speed: 2.3, rate: 1100, label: 'Tormenta galáctica'},
      { time: 50, goal: 50, speed: 2.6, rate:  900, label: 'Apocalipsis'       }
    ]
  },
  hard: {
    name: 'Difícil', color: '#E24B4A', cls: 'hard', perSpawn: 3, icon: '💀',
    levels: [
      { time: 50, goal: 20, speed: 2.0, rate: 1400, label: 'Invasión triple' },
      { time: 48, goal: 32, speed: 2.5, rate: 1100, label: 'Asedio total'    },
      { time: 45, goal: 45, speed: 3.0, rate:  900, label: 'Caos absoluto'   },
      { time: 42, goal: 60, speed: 3.5, rate:  750, label: 'Sin piedad'      },
      { time: 38, goal: 80, speed: 4.2, rate:  600, label: 'Extinción'       }
    ]
  }
};

export default DIFFICULTIES;// exporta la variable con toda las dificultades del juego 
