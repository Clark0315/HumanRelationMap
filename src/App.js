import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import GraphCanvas from './components/GraphCanvas';
import Sidebar from './components/Sidebar';
import { v4 as uuidv4 } from 'uuid';
import useUndoRedo from './hooks/useUndoRedo';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/storage';
import { parsePersonsCSV, parseRelationsCSV, exportPersonsToCSV, exportRelationsToCSV } from './utils/csvParser';

function App() {
  const initialState = { persons: [], relations: [] };
  const { state, pushState, undo, redo, canUndo, canRedo, reset } = useUndoRedo(initialState);
  const { persons, relations } = state;

  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Load data from localStorage on app start
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      reset(savedData);
    }
  }, [reset]);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage({ persons, relations });
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [persons, relations]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const addPerson = useCallback((personData) => {
    const newPerson = {
      id: uuidv4(),
      ...personData,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100
    };
    const newState = {
      persons: [...persons, newPerson],
      relations
    };
    pushState(newState);
  }, [persons, relations, pushState]);

  const updatePerson = useCallback((id, updates) => {
    const newPersons = persons.map(person =>
      person.id === id ? { ...person, ...updates } : person
    );
    const newState = {
      persons: newPersons,
      relations
    };
    pushState(newState);
  }, [persons, relations, pushState]);

  const deletePerson = useCallback((id) => {
    const newPersons = persons.filter(person => person.id !== id);
    const newRelations = relations.filter(relation =>
      relation.from !== id && relation.to !== id
    );
    const newState = {
      persons: newPersons,
      relations: newRelations
    };
    pushState(newState);
    if (selectedNode?.id === id) setSelectedNode(null);
  }, [persons, relations, selectedNode, pushState]);

  const addRelation = useCallback((relationData) => {
    const newRelation = {
      id: uuidv4(),
      ...relationData
    };
    const newState = {
      persons,
      relations: [...relations, newRelation]
    };
    pushState(newState);
  }, [persons, relations, pushState]);

  const updateRelation = useCallback((id, updates) => {
    const newRelations = relations.map(relation =>
      relation.id === id ? { ...relation, ...updates } : relation
    );
    const newState = {
      persons,
      relations: newRelations
    };
    pushState(newState);
  }, [persons, relations, pushState]);

  const deleteRelation = useCallback((id) => {
    const newRelations = relations.filter(relation => relation.id !== id);
    const newState = {
      persons,
      relations: newRelations
    };
    pushState(newState);
    if (selectedEdge?.id === id) setSelectedEdge(null);
  }, [persons, relations, selectedEdge, pushState]);

  const saveData = useCallback(() => {
    const data = { persons, relations };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'human-relations.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [persons, relations]);

  const loadData = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          reset(data);
          setSelectedNode(null);
          setSelectedEdge(null);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  }, [reset]);

  const importCSV = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target.result;
          const importedPersons = parsePersonsCSV(csvText);
          const newState = {
            persons: [...persons, ...importedPersons],
            relations
          };
          pushState(newState);
        } catch (error) {
          alert('CSV格式錯誤');
        }
      };
      reader.readAsText(file);
    }
  }, [persons, relations, pushState]);

  const exportCSV = useCallback(() => {
    const personsCSV = exportPersonsToCSV(persons);
    const relationsCSV = exportRelationsToCSV(relations, persons);

    // Export persons
    const personsBlob = new Blob([personsCSV], { type: 'text/csv;charset=utf-8;' });
    const personsUrl = URL.createObjectURL(personsBlob);
    const personsLink = document.createElement('a');
    personsLink.href = personsUrl;
    personsLink.download = 'persons.csv';
    personsLink.click();
    URL.revokeObjectURL(personsUrl);

    // Export relations
    const relationsBlob = new Blob([relationsCSV], { type: 'text/csv;charset=utf-8;' });
    const relationsUrl = URL.createObjectURL(relationsBlob);
    const relationsLink = document.createElement('a');
    relationsLink.href = relationsUrl;
    relationsLink.download = 'relations.csv';
    relationsLink.click();
    URL.revokeObjectURL(relationsUrl);
  }, [persons, relations]);

  const mergePerson = useCallback((person1Id, person2Id, keepFirst = true) => {
    const person1 = persons.find(p => p.id === person1Id);
    const person2 = persons.find(p => p.id === person2Id);

    if (!person1 || !person2) return;

    const keepPerson = keepFirst ? person1 : person2;
    const removePerson = keepFirst ? person2 : person1;

    // Update relations
    const newRelations = relations.map(relation => {
      let newRelation = { ...relation };
      if (relation.from === removePerson.id) newRelation.from = keepPerson.id;
      if (relation.to === removePerson.id) newRelation.to = keepPerson.id;
      return newRelation;
    }).filter(relation => relation.from !== relation.to); // Remove self-relations

    // Remove duplicate relations
    const uniqueRelations = newRelations.filter((relation, index, self) =>
      index === self.findIndex(r => r.from === relation.from && r.to === relation.to)
    );

    const newPersons = persons.filter(p => p.id !== removePerson.id);

    const newState = {
      persons: newPersons,
      relations: uniqueRelations
    };

    pushState(newState);

    if (selectedNode?.id === removePerson.id) setSelectedNode(keepPerson);
  }, [persons, relations, selectedNode, pushState]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Menu Bar */}
      <div className="bg-white shadow-md p-4 flex gap-2 flex-wrap">
        <button
          onClick={saveData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          儲存 JSON
        </button>

        <label className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer text-sm">
          讀取 JSON
          <input
            type="file"
            accept=".json"
            onChange={loadData}
            className="hidden"
          />
        </label>

        <label className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 cursor-pointer text-sm">
          匯入 CSV
          <input
            type="file"
            accept=".csv"
            onChange={importCSV}
            className="hidden"
          />
        </label>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
        >
          匯出 CSV
        </button>

        <div className="border-l border-gray-300 mx-2"></div>

        <button
          onClick={undo}
          disabled={!canUndo}
          className={`px-4 py-2 rounded text-sm ${
            canUndo
              ? 'bg-gray-500 text-white hover:bg-gray-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          復原 (Ctrl+Z)
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={`px-4 py-2 rounded text-sm ${
            canRedo
              ? 'bg-gray-500 text-white hover:bg-gray-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          重做 (Ctrl+Y)
        </button>

        <div className="border-l border-gray-300 mx-2"></div>

        <button
          onClick={() => {
            const name = prompt('請輸入姓名：');
            if (name) {
              addPerson({ name, photo: '', phone: '', note: '' });
            }
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
        >
          新增人員
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1">
          <GraphCanvas
            persons={persons}
            relations={relations}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onSelectNode={setSelectedNode}
            onSelectEdge={setSelectedEdge}
            onUpdatePerson={updatePerson}
            onDeletePerson={deletePerson}
            onAddRelation={addRelation}
            onDeleteRelation={deleteRelation}
            onMergePerson={mergePerson}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg">
          <Sidebar
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            persons={persons}
            relations={relations}
            onUpdatePerson={updatePerson}
            onUpdateRelation={updateRelation}
            onAddRelation={addRelation}
            onMergePerson={mergePerson}
          />
        </div>
      </div>
    </div>
  );
}

export default App;