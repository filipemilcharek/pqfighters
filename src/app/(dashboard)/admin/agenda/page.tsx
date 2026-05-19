"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  User,
  RefreshCw,
} from "lucide-react";
import { DAY_NAMES } from "@/lib/utils";

interface Booking {
  id: string;
  type: string;
  date: string;
  checkedIn: boolean;
  checkinStatus?: string | null;
  groupClassId?: string | null;
  privateSlotId?: string | null;
  user: { id: string; name: string } | null;
  privateSlot?: { id: string; startTime: string; endTime: string } | null;
  groupClass?: { id: string; name: string; startTime: string; endTime: string } | null;
}

interface GroupClass {
  id: string;
  name: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
}

interface PrivateSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  userId: string | null;
  user: { id: string; name: string } | null;
}

export default function AdminAgendaPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [groupClasses, setGroupClasses] = useState<GroupClass[]>([]);
  const [slots, setSlots] = useState<PrivateSlot[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDayOfWeek = selectedDate.getDay();
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetch("/api/group-classes").then((r) => r.json()).then(setGroupClasses);
    fetch("/api/slots").then((r) => r.json()).then(setSlots);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bookings/pending?date=${selectedDateStr}`)
      .then((r) => r.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      });
  }, [selectedDateStr]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const dayClasses = groupClasses.filter((gc) => gc.dayOfWeek === selectedDayOfWeek);
  const dayBookings = bookings.filter((b) => b.date === selectedDateStr);

  const daySlots = slots.filter(
    (s) => s.dayOfWeek === selectedDayOfWeek && s.isAvailable
  );

  function getBookingsForClass(classId: string): Booking[] {
    return dayBookings.filter((b) => b.groupClassId === classId);
  }

  function getBookingForSlot(slotId: string): Booking | undefined {
    return dayBookings.find((b) => b.privateSlotId === slotId);
  }

  function hasItems(date: Date) {
    const dow = date.getDay();
    return (
      groupClasses.some((gc) => gc.dayOfWeek === dow) ||
      slots.some((s) => s.dayOfWeek === dow && s.isAvailable)
    );
  }

  function statusBadge(booking: Booking) {
    if (booking.checkinStatus === "PRESENTE" || booking.checkedIn)
      return <Badge variant="success">Presente</Badge>;
    if (booking.checkinStatus === "CANCELADO")
      return <Badge variant="danger">Cancelou</Badge>;
    if (booking.checkinStatus === "AUSENTE")
      return <Badge variant="default">Ausente</Badge>;
    return <Badge variant="default">Agendado</Badge>;
  }

  function refetchBookings() {
    setLoading(true);
    fetch(`/api/bookings/pending?date=${selectedDateStr}`)
      .then((r) => r.json())
      .then((data) => {
        setBookings(data);
        setLoading(false);
      });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Agenda do Dia</h1>
        <Button variant="ghost" size="sm" onClick={refetchBookings} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Week navigation */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
          >
            <ChevronLeft size={18} />
          </Button>
          <span className="font-medium text-sm text-zinc-50">
            {format(currentWeekStart, "d MMM", { locale: ptBR })} -{" "}
            {format(addDays(currentWeekStart, 6), "d MMM yyyy", {
              locale: ptBR,
            })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
          >
            <ChevronRight size={18} />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = format(day, "yyyy-MM-dd") === today;
            const has = hasItems(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center p-1.5 sm:p-2 rounded-md text-sm transition-colors ${
                  isSelected
                    ? "bg-orange-500 text-zinc-50"
                    : isToday
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-800"
                }`}
              >
                <span className="text-[10px] sm:text-xs uppercase text-zinc-400">
                  <span className="sm:hidden">{format(day, "EEEEE", { locale: ptBR })}</span>
                  <span className="hidden sm:inline">{format(day, "EEE", { locale: ptBR })}</span>
                </span>
                <span className="font-medium text-zinc-50 text-sm sm:text-base">{format(day, "d")}</span>
                {has && (
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 sm:mt-1 ${
                      isSelected ? "bg-white" : "bg-orange-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Day details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-50">
          {format(selectedDate, "d 'de' MMMM, EEEE", { locale: ptBR })}
        </h2>

        {loading && (
          <p className="text-zinc-400 text-sm">Carregando...</p>
        )}

        {!loading && (
          <>
            {/* Group classes */}
            {dayClasses.map((gc) => {
              const classBookings = getBookingsForClass(gc.id);
              return (
                <Card key={gc.id} className="!p-4 border-l-4 border-l-accent">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-zinc-400" />
                    <span className="text-sm font-semibold text-zinc-50">
                      {gc.startTime} - {gc.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="font-medium text-zinc-50">{gc.name}</p>
                    <Badge>Coletiva</Badge>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Users size={12} />
                      {classBookings.length}/{gc.capacity}
                    </span>
                  </div>
                  {classBookings.length > 0 ? (
                    <div className="space-y-1.5">
                      {classBookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">{b.user?.name}</span>
                          {statusBadge(b)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">Nenhum aluno agendado</p>
                  )}
                </Card>
              );
            })}

            {/* Private slots (bound) */}
            {daySlots.filter((s) => s.userId).map((slot) => {
              const booking = getBookingForSlot(slot.id);
              return (
                <Card key={slot.id} className="!p-4 border-l-4 border-l-emerald-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-zinc-400" />
                    <span className="text-sm font-semibold text-zinc-50">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium text-zinc-50">Aula Particular</p>
                    <Badge variant="success">Particular</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <User size={12} />
                      {slot.user?.name}
                    </span>
                    {booking ? statusBadge(booking) : (
                      <Badge variant="default">Pendente</Badge>
                    )}
                  </div>
                </Card>
              );
            })}

            {/* Private slots (open, student-booked) */}
            {daySlots.filter((s) => !s.userId).map((slot) => {
              const booking = getBookingForSlot(slot.id);
              if (!booking) return null;
              return (
                <Card key={slot.id} className="!p-4 border-l-4 border-l-yellow-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-zinc-400" />
                    <span className="text-sm font-semibold text-zinc-50">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium text-zinc-50">Aula Particular</p>
                    <Badge variant="success">Particular (Aberto)</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <User size={12} />
                      {booking.user?.name}
                    </span>
                    {statusBadge(booking)}
                  </div>
                </Card>
              );
            })}

            {/* Empty state */}
            {dayClasses.length === 0 && daySlots.length === 0 && (
              <Card className="!p-8">
                <p className="text-zinc-400 text-sm text-center">
                  {DAY_NAMES[selectedDayOfWeek] === "Domingo" || DAY_NAMES[selectedDayOfWeek] === "Sábado"
                    ? "Sem aulas programadas para o fim de semana"
                    : "Nenhuma aula programada para este dia"}
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
