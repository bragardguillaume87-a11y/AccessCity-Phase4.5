// === Fichier : core/main.js (VERSION CORRIGEE) ===
import { sampleScenes, sampleDialoguesByScene } from './sampleData.js';
import { loadScenesFromJson } from './jsonSceneLoader.js';
import { loadUiLayouts } from './uiLayoutLoader.js';
import SceneList from '../ui/SceneList.js';
import DialogueList from '../ui/DialogueList.js';
import InspectorPanel from '../ui/InspectorPanel.js';
import DevToolsPanel from '../ui/DevToolsPanel.js';

const stateManager = {
  scenes: [],
  dialoguesByScene: {},
  selectedSceneId: null,
  selectedDialogueId: null,
  currentDialogues: [],
  selectedDialogue: null
};

const sceneListPanel = new SceneList(document.getElementById('scene-panel'), {
  onSceneSelected: (sceneId) => {
    stateManager.selectedSceneId = sceneId;
    stateManager.currentDialogues = stateManager.dialoguesByScene[sceneId] || [];
    updateUI();
  }
});

const dialogueListPanel = new DialogueList(document.getElementById('dialogue-panel'), {
  onDialogueSelected: (dialogueId) => {
    stateManager.selectedDialogueId = dialogueId;
    stateManager.selectedDialogue = stateManager.currentDialogues.find(d => d.id === dialogueId);
    updateUI();
  }
});

const inspectorPanel = new InspectorPanel(document.getElementById('inspector-panel'), {
  onDialogueChange: (updatedDialogue) => {
    // Handle dialogue update logic
  }
});

const devToolsPanel = new DevToolsPanel(document.getElementById('devtools-panel'));

function updateUI() {
  sceneListPanel.update(stateManager);
  dialogueListPanel.update(stateManager);
  inspectorPanel.update(stateManager);
  devToolsPanel.update(stateManager);
}

async function initApp() {
  try {
    // CORRECTION : Chemin correct vers data/ui_layout.json
    const layouts = await loadUiLayouts('./data/ui_layout.json');
    console.log('Layouts loaded:', layouts);
    
    // Apply default layout
    if (layouts && layouts.standard) {
      applyLayout(layouts.standard);
    }
    
    // Load scenes
    try {
      const data = await loadScenesFromJson('./data/scenes.json');
      stateManager.scenes = data.scenes;
      stateManager.dialoguesByScene = data.dialoguesByScene;
    } catch (error) {
      console.error('Error loading scenes.json, using fallback data');
      stateManager.scenes = sampleScenes;
      stateManager.dialoguesByScene = sampleDialoguesByScene;
    }
    
    updateUI();
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

function applyLayout(layout) {
  if (!layout || !layout.panels) return;
  layout.panels.forEach(panel => {
    const element = document.getElementById(panel.id + '-panel');
    if (element) {
      element.style.display = panel.visible ? 'block' : 'none';
      if (panel.width_ratio) {
        element.style.flex = panel.width_ratio;
      }
    }
  });
}

// Export/Import functions
window.exportScenario = function() {
  const json = JSON.stringify({ scenes: stateManager.scenes, dialoguesByScene: stateManager.dialoguesByScene }, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    console.log('Scenario copied to clipboard');
  });
};

window.importScenario = function() {
  const json = prompt('Paste JSON scenario:');
  if (json) {
    try {
      const data = JSON.parse(json);
      stateManager.scenes = data.scenes || [];
      stateManager.dialoguesByScene = data.dialoguesByScene || {};
      updateUI();
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  }
};

initApp();
