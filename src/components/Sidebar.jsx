import React, { useState, useEffect } from 'react';

const Sidebar = ({
  selectedNode,
  selectedEdge,
  persons,
  relations,
  onUpdatePerson,
  onUpdateRelation,
  onAddRelation,
  onMergePerson
}) => {
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      setEditData(selectedNode);
      setIsEditing(false);
    } else if (selectedEdge) {
      setEditData(selectedEdge);
      setIsEditing(false);
    } else {
      setEditData({});
      setIsEditing(false);
    }
  }, [selectedNode, selectedEdge]);

  const handleSave = () => {
    if (selectedNode) {
      onUpdatePerson(selectedNode.id, editData);
    } else if (selectedEdge) {
      onUpdateRelation(selectedEdge.id, editData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (selectedNode) {
      setEditData(selectedNode);
    } else if (selectedEdge) {
      setEditData(selectedEdge);
    }
    setIsEditing(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditData(prev => ({ ...prev, photo: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRelation = () => {
    const toPersonId = document.getElementById('relationTo').value;
    const label = document.getElementById('relationLabel').value;

    if (toPersonId && label && label.length <= 8) {
      onAddRelation({
        from: selectedNode.id,
        to: toPersonId,
        label,
        note: ''
      });

      // Clear form
      document.getElementById('relationTo').value = '';
      document.getElementById('relationLabel').value = '';
    }
  };

  const handleMergePerson = () => {
    const targetPersonId = document.getElementById('mergeTarget').value;
    const keepFirst = document.getElementById('mergeKeepFirst').checked;

    if (targetPersonId && targetPersonId !== selectedNode.id) {
      const targetPerson = persons.find(p => p.id === targetPersonId);
      const confirmMessage = keepFirst
        ? `確定要合併節點嗎？\n將保留「${selectedNode.name}」的資料，刪除「${targetPerson.name}」`
        : `確定要合併節點嗎？\n將保留「${targetPerson.name}」的資料，刪除「${selectedNode.name}」`;

      if (window.confirm(confirmMessage)) {
        onMergePerson(selectedNode.id, targetPersonId, keepFirst);
        // Clear form
        document.getElementById('mergeTarget').value = '';
        document.getElementById('mergeKeepFirst').checked = true;
      }
    }
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-bold mb-4">人際關係圖</h3>
        <p className="text-gray-500">請選擇一個節點或關係線來查看詳細資訊</p>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">統計資訊</h4>
          <p className="text-sm text-gray-600">總人數: {persons.length}</p>
          <p className="text-sm text-gray-600">總關係: {relations.length}</p>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">操作說明</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 點擊節點查看詳細資訊</li>
            <li>• 拖曳節點調整位置</li>
            <li>• 右鍵點擊開啟選單</li>
            <li>• 滾輪縮放畫布</li>
          </ul>
        </div>
      </div>
    );
  }

  if (selectedNode) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">人員資料</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              編輯
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Photo */}
          <div>
            <label className="block text-sm font-medium mb-2">照片</label>
            {editData.photo && (
              <img
                src={editData.photo}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover mb-2"
              />
            )}
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">姓名</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-gray-700">{editData.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">電話</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.phone || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-gray-700">{editData.phone || '未設定'}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-1">備註</label>
            {isEditing ? (
              <textarea
                value={editData.note || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, note: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20"
              />
            ) : (
              <p className="text-gray-700">{editData.note || '無'}</p>
            )}
          </div>

          {/* Action buttons */}
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                儲存
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          )}

          {/* Relations */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">相關關係</h4>
            <div className="space-y-2">
              {relations
                .filter(r => r.from === selectedNode.id || r.to === selectedNode.id)
                .map(relation => {
                  const isOutgoing = relation.from === selectedNode.id;
                  const otherPersonId = isOutgoing ? relation.to : relation.from;
                  const otherPerson = persons.find(p => p.id === otherPersonId);

                  return (
                    <div key={relation.id} className="text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium">
                        {isOutgoing ? '→' : '←'} {otherPerson?.name}
                      </span>
                      <span className="text-gray-600 ml-2">({relation.label})</span>
                    </div>
                  );
                })}
            </div>

            {/* Add new relation */}
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <h5 className="text-sm font-medium mb-2">新增關係</h5>
              <select
                id="relationTo"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
              >
                <option value="">選擇對象...</option>
                {persons
                  .filter(p => p.id !== selectedNode.id)
                  .map(person => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
              </select>
              <input
                id="relationLabel"
                type="text"
                placeholder="關係名稱（最多8字）"
                maxLength="8"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
              />
              <button
                onClick={handleAddRelation}
                className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                新增關係
              </button>
            </div>

            {/* Merge person */}
            {persons.length > 1 && (
              <div className="mt-4 p-3 bg-orange-50 rounded">
                <h5 className="text-sm font-medium mb-2">合併節點</h5>
                <select
                  id="mergeTarget"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
                >
                  <option value="">選擇要合併的對象...</option>
                  {persons
                    .filter(p => p.id !== selectedNode.id)
                    .map(person => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                </select>

                <div className="mb-2">
                  <label className="flex items-center text-sm">
                    <input
                      id="mergeKeepFirst"
                      type="checkbox"
                      defaultChecked={true}
                      className="mr-2"
                    />
                    保留當前節點「{selectedNode.name}」的資料
                  </label>
                </div>

                <button
                  onClick={handleMergePerson}
                  className="w-full px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                >
                  合併節點
                </button>

                <p className="text-xs text-gray-600 mt-1">
                  💡 合併後可使用 Ctrl+Z 復原操作
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    const fromPerson = persons.find(p => p.id === selectedEdge.from);
    const toPerson = persons.find(p => p.id === selectedEdge.to);

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">關係資料</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              編輯
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Relation info */}
          <div>
            <label className="block text-sm font-medium mb-1">關係</label>
            <p className="text-gray-700">
              {fromPerson?.name} → {toPerson?.name}
            </p>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium mb-1">關係名稱</label>
            {isEditing ? (
              <input
                type="text"
                maxLength="8"
                value={editData.label || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, label: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            ) : (
              <p className="text-gray-700">{editData.label}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-1">備註</label>
            {isEditing ? (
              <textarea
                value={editData.note || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, note: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20"
              />
            ) : (
              <p className="text-gray-700">{editData.note || '無'}</p>
            )}
          </div>

          {/* Action buttons */}
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                儲存
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Sidebar;