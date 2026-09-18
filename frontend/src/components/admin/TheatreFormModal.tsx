"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { theatreService } from "@/services";
import { useUsers } from "@/hooks";
import { parseApiError } from "@/lib/axios";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import type { TheatreRequestDTO } from "@/types";

interface TheatreFormModalProps {
  open: boolean;
  onClose: () => void;
}

const SEAT_TYPES = ["SINGLE", "COUPLE", "SINGLE_SOFA", "COUPLE_SOFA"];

export function TheatreFormModal({ open, onClose }: TheatreFormModalProps) {
  const qc = useQueryClient();
  const { data: usersData } = useUsers(0, 50);

const userOptions = usersData?.pageData
  ?.filter((u) => u.userRole === "ROLE_THEATRE_ADMIN")
  .map((u) => ({
    value: u.userId.toString(),
    label: `${u.firstName} ${u.lastName} (${u.userEmail})`,
  })) || [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TheatreRequestDTO>({
    defaultValues: {
      theatreName: "",
      theatreLocation: "",
      theatreAdminId: undefined,
      screens: [
        {
          screenName: "Screen 1",
          seats: [
            { rowId: 1, seatNumber: 1, seatType: "SINGLE", seatPrice: 10 },
          ],
        },
      ],
    },
  });

  const { fields: screenFields, append: addScreen, remove: removeScreen } =
    useFieldArray({ control, name: "screens" });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (data: TheatreRequestDTO) =>
      theatreService.create({
        ...data,
        theatreAdminId: Number(data.theatreAdminId),
        screens: data.screens.map((s) => {
          // Generate a block of seats based on the row and "seatNumber" (which acts as seatCount here)
          const generatedSeats: any[] = [];
          s.seats.forEach((seatDef) => {
            const count = Number(seatDef.seatNumber);
            const rowId = Number(seatDef.rowId);
            const price = Number(seatDef.seatPrice);
            for (let i = 1; i <= count; i++) {
              generatedSeats.push({
                rowId,
                seatNumber: i,
                seatType: seatDef.seatType,
                seatPrice: price,
              });
            }
          });
          return {
            ...s,
            seats: generatedSeats,
          };
        }),
      }),
    onSuccess: (t) => {
      toast.success(`"${t.theatreName}" created!`);
      qc.invalidateQueries({ queryKey: ["theatres"] });
      onClose();
    },
    onError: (e) => toast.error(parseApiError(e).message),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Theatre"
      subtitle="Create a new theatre with screens and seats"
      size="lg"
    >
      <form
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1"
      >
        {/* Theatre Details */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Theatre Name"
            placeholder="e.g. PVR Cinemas IMAX"
            error={errors.theatreName?.message}
            {...register("theatreName", { required: "Name required" })}
          />
          <Input
            label="Location / City"
            placeholder="e.g. Mumbai"
            error={errors.theatreLocation?.message}
            {...register("theatreLocation", { required: "Location required" })}
          />
        </div>

        <Select
          label="Theatre Admin"
          options={userOptions}
          error={errors.theatreAdminId?.message as string | undefined}
          {...register("theatreAdminId", { required: "Admin User is required" })}
        />

        {/* Screens */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">
              Screens
            </h3>
            <button
              type="button"
              onClick={() =>
                addScreen({
                  screenName: `Screen ${screenFields.length + 1}`,
                  seats: [
                    {
                      rowId: 1,
                      seatNumber: 1,
                      seatType: "SINGLE",
                      seatPrice: 10,
                    },
                  ],
                })
              }
              className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> Add Screen
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {screenFields.map((screen, sIdx) => (
              <div
                key={screen.id}
                className="bg-surface-2 rounded-lg p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <Input
                    placeholder="Screen name"
                    className="text-sm h-9 w-48"
                    {...register(`screens.${sIdx}.screenName` as const)}
                  />
                  {screenFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScreen(sIdx)}
                      className="text-primary hover:text-primary-hover"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <p className="text-xs text-text-secondary mb-2">
                  Define at least one seat type for this screen:
                </p>

                {/* Compact seat config */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <span className="text-text-secondary font-semibold uppercase">Row</span>
                  <span className="text-text-secondary font-semibold uppercase">Seats per Row</span>
                  <span className="text-text-secondary font-semibold uppercase">Type</span>
                  <span className="text-text-secondary font-semibold uppercase">Price €</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  <input
                    type="number"
                    className="bg-surface border border-border rounded px-2 py-1.5 text-white text-sm outline-none"
                    defaultValue={1}
                    {...register(`screens.${sIdx}.seats.0.rowId` as const)}
                  />
                  <input
                    type="number"
                    className="bg-surface border border-border rounded px-2 py-1.5 text-white text-sm outline-none"
                    defaultValue={10}
                    {...register(`screens.${sIdx}.seats.0.seatNumber` as const)}
                  />
                  <select
                    className="bg-surface border border-border rounded px-2 py-1.5 text-white text-sm outline-none"
                    {...register(`screens.${sIdx}.seats.0.seatType` as const)}
                  >
                    {SEAT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="bg-surface border border-border rounded px-2 py-1.5 text-white text-sm outline-none"
                    defaultValue={10}
                    {...register(`screens.${sIdx}.seats.0.seatPrice` as const)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-surface py-3 -mx-6 px-6 border-t border-border mt-2">
          <button
            type="button"
            onClick={onClose}
            className="border border-border hover:border-white/60 text-white px-5 py-2.5 rounded text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-2.5 rounded text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Create Theatre
          </button>
        </div>
      </form>
    </Modal>
  );
}
