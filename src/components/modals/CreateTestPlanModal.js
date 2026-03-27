import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API } from "../../utils/constants";
import { fetchJson } from "../../utils/helpers";

export const CreateTestPlanModal = ({
  isOpen,
  onClose,
  onCreated,
  initialTests = [],
}) => {
  const [name, setName] = useState("");
  const [env, setEnv] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !env.trim()) {
      alert("Имя и env обязательны");
      return;
    }
    setIsCreating(true);
    try {
      const payload = {
        name: name.trim(),
        env: env.trim(),
        tests: initialTests.map((test) => test.test_id),
      };
      const createdPlan = await fetchJson(`${API}/testplan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      onCreated?.(createdPlan);
      setName("");
      setEnv("");
      onClose();
    } catch (err) {
      console.error("Ошибка создания тест-плана:", err);
      alert("Не удалось создать тест-план");
    } finally {
      setIsCreating(false);
      window.clearCheckboxes();
    }
  };

  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Создать тест-план</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Имя
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Среда
              </label>
              <Input
                value={env}
                onChange={(e) => setEnv(e.target.value)}
                required
              />
            </div>
            {initialTests.length > 0 && (
              <div className="text-sm text-gray-600">
                Будет добавлено тестов: <strong>{initialTests.length}</strong>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Создание..." : "Создать"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
