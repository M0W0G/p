"use client";

import { useState, useEffect } from "react";
import { useModuleStore, ModuleWithSteps } from "@/store/moduleStore";
import { Step } from "@/lib/firebase/types";
import AddFeatureModal from "./AddStepModal";
import StepEditorModal from "./StepEditorModal";
import { useAlert } from "@/context/AlertContext";

interface ModuleEditorProps {
  moduleId: string | null;
  onClose: () => void;
}

export default function ModuleEditor({ moduleId, onClose }: ModuleEditorProps) {
  const {
    modules,
    createNewModule,
    updateModuleData,
    saveModuleWithSteps, // Use the new action
  } = useModuleStore();
  const { showAlert, showConfirm } = useAlert();

  // Get the latest module data from store
  const module = moduleId ? modules.find((m) => m.id === moduleId) : null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 1,
  });

  // Local state for steps (draft)
  const [steps, setSteps] = useState<Step[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title,
        description: module.description,
        order: module.order ?? 1,
      });
      // Initialize steps from module
      setSteps(module.steps || []);
    } else {
      // For new modules, find the next available order number
      const nextOrder = modules.length + 1;
      setFormData({
        title: "",
        description: "",
        order: nextOrder,
      });
      setSteps([]);
    }
  }, [module, modules]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      await showAlert("Validation Error", "Please enter a module title", "error");
      return;
    }

    // Check for duplicate order numbers
    const existingModuleWithOrder = modules.find(
      (m) => m.order === formData.order && m.id !== module?.id,
    );

    if (existingModuleWithOrder) {
      await showAlert(
        "Validation Error",
        `Order number ${formData.order} is already used by "${existingModuleWithOrder.title}". Please choose a different number.`,
        "error"
      );
      return;
    }

    setIsSaving(true);
    try {
      // Use the new atomic save action
      await saveModuleWithSteps(
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          order: formData.order,
        },
        steps
      );
      onClose();
    } catch (error) {
      console.error("Error saving module:", error);
      await showAlert("Error", "Failed to save module. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    const confirmed = await showConfirm(
      "Delete Step",
      "Are you sure you want to delete this step?"
    );
    if (!confirmed) return;

    // Update local state only
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  };

  const handleCloneStep = async (stepId: string) => {
    const stepToClone = steps.find((s) => s.id === stepId);
    if (!stepToClone) return;

    // Clone locally
    const { id, createdAt, updatedAt, ...clonedData } = stepToClone;

    const tempId = `temp-${Date.now()}`;

    const newStep = {
      ...clonedData,
      id: tempId,
      title: `${clonedData.title} (Copy)`,
      updatedAt: new Date(),
      createdAt: new Date(),
      order: steps.length,
    } as Step;

    setSteps((prev) => [...prev, newStep]);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newSteps = [...steps];
    const draggedStep = newSteps[draggedIndex];
    newSteps.splice(draggedIndex, 1);
    newSteps.splice(dropIndex, 0, draggedStep);

    // Update local steps
    setSteps(newSteps);
    setDraggedIndex(null);
  };

  // New handler for saving steps from modals
  const handleStepSave = (savedStep: Step) => {
    setSteps((prev) => {
      // Check if updating existing
      const index = prev.findIndex((s) => s.id === savedStep.id);
      if (index >= 0) {
        const newSteps = [...prev];
        newSteps[index] = savedStep;
        return newSteps;
      } else {
        // Add new
        return [...prev, savedStep];
      }
    });
  };

  const getStepIcon = (type: Step["type"]) => {
    switch (type) {
      case "video":
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "flashcards":
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "quiz":
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "freeResponse":
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case "poll":
        return (
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "additionalResources":
        return (
          <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {module ? "Edit Module" : "Create New Module"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Module Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Enter module title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={isSaving}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                rows={3}
                placeholder="Enter module description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order *
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 1,
                  })
                }
                disabled={isSaving}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Order in which modules appear on the student page
              </p>
            </div>
          </div>

          {/* Steps Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Steps</h3>
              <button
                onClick={() => setShowAddStepModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Step
              </button>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <p>No steps yet. Click &quot;Add Step&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 cursor-move"
                  >
                    <div className="flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </div>
                    <div className="flex-shrink-0">
                      {getStepIcon(step.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize">
                        {step.type === "freeResponse"
                          ? "Free Response"
                          : step.type === "additionalResources"
                            ? "Additional Resources"
                            : step.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingStep(step)}
                        className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleCloneStep(step.id)}
                        title="Clone step"
                        className="text-gray-400 hover:text-green-600 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            {isSaving && (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isSaving
              ? "Saving..."
              : module
                ? "Update Module"
                : "Create Module"}
          </button>
        </div>
      </div>

      {/* Add Step Modal */}
      {showAddStepModal && (
        <AddFeatureModal
          moduleId={module?.id || "new-module"}
          onClose={() => setShowAddStepModal(false)}
          onSave={handleStepSave}
        />
      )}

      {/* Edit Step Modal */}
      {editingStep && (
        <StepEditorModal
          moduleId={module?.id || "new-module"}
          step={editingStep}
          onClose={() => setEditingStep(null)}
          onSave={handleStepSave}
        />
      )}
    </div>
  );
}