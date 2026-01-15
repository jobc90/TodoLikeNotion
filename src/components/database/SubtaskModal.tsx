"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Subtask } from "@/types/database";

interface SubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtasks: Subtask[];
  onSave: (subtasks: Subtask[]) => void;
  cardTitle: string;
}

export default function SubtaskModal({
  isOpen,
  onClose,
  subtasks,
  onSave,
  cardTitle,
}: SubtaskModalProps) {
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>(subtasks);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSubtasks(subtasks);
  }, [subtasks]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;

    const newSubtask: Subtask = {
      id: generateId(),
      text: newSubtaskText.trim(),
      completed: false,
    };

    setLocalSubtasks([...localSubtasks, newSubtask]);
    setNewSubtaskText("");
  };

  const handleToggleSubtask = (id: string) => {
    setLocalSubtasks(
      localSubtasks.map((st) =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setLocalSubtasks(localSubtasks.filter((st) => st.id !== id));
  };

  const handleSave = () => {
    onSave(localSubtasks);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const completedCount = localSubtasks.filter((st) => st.completed).length;
  const totalCount = localSubtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="subtask-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="subtask-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="subtask-modal-header">
              <h3 className="subtask-modal-title">{cardTitle}</h3>
              <button
                className="subtask-modal-close"
                onClick={onClose}
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Progress Bar */}
            {totalCount > 0 && (
              <div className="subtask-progress-container">
                <div className="subtask-progress-info">
                  <span className="subtask-progress-label">체크리스트</span>
                  <span className="subtask-progress-count">
                    {completedCount}/{totalCount}
                  </span>
                </div>
                <div className="subtask-progress-bar">
                  <motion.div
                    className="subtask-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Subtask List */}
            <div className="subtask-list">
              <AnimatePresence mode="popLayout">
                {localSubtasks.map((subtask) => (
                  <motion.div
                    key={subtask.id}
                    className="subtask-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <label className="subtask-checkbox-label">
                      <input
                        type="checkbox"
                        className="subtask-checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(subtask.id)}
                      />
                      <span className="subtask-checkbox-custom"></span>
                    </label>
                    <span
                      className={`subtask-text ${
                        subtask.completed ? "completed" : ""
                      }`}
                    >
                      {subtask.text}
                    </span>
                    <button
                      className="subtask-delete-btn"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      title="Delete subtask"
                    >
                      🗑
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Subtask Input */}
            <div className="subtask-add-container">
              <input
                ref={inputRef}
                type="text"
                className="subtask-add-input"
                placeholder="새 서브태스크 추가..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="subtask-add-btn" onClick={handleAddSubtask}>
                추가
              </button>
            </div>

            {/* Actions */}
            <div className="subtask-modal-actions">
              <button className="subtask-btn-cancel" onClick={onClose}>
                취소
              </button>
              <button className="subtask-btn-save" onClick={handleSave}>
                저장
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Utility: Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
