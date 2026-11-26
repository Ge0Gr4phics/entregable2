import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppContext } from "../context/AppContext";
import { aniosDisponibles, resumenAnual } from "../dominio/resumenAnual";
import { AppTabsParamList } from "../navigation/AppNavigator";
import {
  listUserItems,
  migrateMissingVistaEn,
  updateTMDBMetadata,
} from "../services/myListService";
import { getMediaDetail } from "../services/tmdbService";
import { colors } from "../theme";

const monthNames = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function MyYearScreen(): React.ReactElement {
  const navigation = useNavigation<NavigationProp<AppTabsParamList>>();
  const { user, items, isOffline, refreshList } = useAppContext();
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => aniosDisponibles(items, currentYear),
    [items, currentYear],
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [loadingData, setLoadingData] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [dataError, setDataError] = useState<string | null>(null);
  const migratedUsers = useRef(new Set<string>());
  const completedSignatures = useRef(new Set<string>());
  const attemptedItems = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    const migrationKey = user?.uid ?? "";
    const signature = items
      .filter((item) => {
        if (item.estado !== "vista" || !item.vistaEn) return false;
        return new Date(item.vistaEn).getFullYear() === selectedYear;
      })
      .map(
        (item) =>
          `${item.id}:${item.generos.length}:${item.duracionMin}:${item.directores.length}`,
      )
      .sort()
      .join("|");
    const preparationKey = `${migrationKey}:${selectedYear}:${signature}`;

    if (completedSignatures.current.has(preparationKey)) {
      return () => {
        active = false;
      };
    }

    async function prepareData(): Promise<void> {
      if (!user || isOffline) {
        return;
      }

      setLoadingData(true);
      setDataError(null);

      try {
        if (!migratedUsers.current.has(migrationKey)) {
          await migrateMissingVistaEn(user.uid);
          migratedUsers.current.add(migrationKey);
          await refreshList();
        }

        const refreshedItems = await listUserItems(user.uid);
        const viewedInYear = refreshedItems.filter((item) => {
          if (item.estado !== "vista" || !item.vistaEn) return false;
          return new Date(item.vistaEn).getFullYear() === selectedYear;
        });

        const missing = viewedInYear.filter(
          (item) =>
            !attemptedItems.current.has(item.id) &&
            (item.generos.length === 0 ||
              (item.type === "movie" &&
                (item.duracionMin === null || item.directores.length === 0))),
        );

        setProgress({ current: 0, total: missing.length });

        for (let index = 0; index < missing.length; index += 1) {
          if (!active) return;
          setProgress({ current: index + 1, total: missing.length });
          attemptedItems.current.add(missing[index].id);
          try {
            const detail = await getMediaDetail(
              missing[index].type,
              missing[index].tmdbId,
            );
            await updateTMDBMetadata(user.uid, missing[index].id, {
              generos: detail.generos,
              duracionMin: detail.duracionMin,
              directores: detail.directores,
            });
          } catch (error) {
            console.warn("No se pudieron completar los datos TMDB.", error);
          }
        }

        if (active && missing.length > 0) {
          await refreshList();
        }
      } catch (error) {
        if (active) {
          setDataError(
            error instanceof Error
              ? error.message
              : "No se pudieron preparar los datos del resumen.",
          );
        }
      } finally {
        if (active) {
          completedSignatures.current.add(preparationKey);
          setLoadingData(false);
          setProgress({ current: 0, total: 0 });
        }
      }
    }

    void prepareData();
    return () => {
      active = false;
    };
  }, [isOffline, items, refreshList, selectedYear, user]);

  const summary = resumenAnual(items, selectedYear);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mi año en cine</Text>
      <Text style={styles.subtitle}>Tu resumen personalizado</Text>

      <View style={styles.yearRow}>
        {years.map((year) => (
          <Pressable
            key={year}
            style={[
              styles.yearButton,
              selectedYear === year && styles.yearButtonSelected,
            ]}
            onPress={() => setSelectedYear(year)}
          >
            <Text
              style={[
                styles.yearText,
                selectedYear === year && styles.yearTextSelected,
              ]}
            >
              {year}
            </Text>
          </Pressable>
        ))}
      </View>

      {isOffline ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Sin conexión. Se muestra la copia guardada en este teléfono.
          </Text>
        </View>
      ) : null}

      {loadingData ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.status}>
            {progress.total > 0
              ? `Completando datos: ${progress.current} de ${progress.total}`
              : "Preparando resumen..."}
          </Text>
        </View>
      ) : null}

      {dataError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>No pudimos completar el resumen</Text>
          <Text style={styles.errorText}>{dataError}</Text>
        </View>
      ) : null}

      {summary.totalObras === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            Aún no hay obras vistas en {selectedYear}
          </Text>
          <Text style={styles.emptyText}>
            Marca una obra como vista y aparecerá aquí.
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate("MiLista")}
          >
            <Text style={styles.primaryButtonText}>Ir a Mi lista</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{summary.totalObras}</Text>
              <Text style={styles.statLabel}>Obras vistas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{summary.peliculas}</Text>
              <Text style={styles.statLabel}>Películas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{summary.series}</Text>
              <Text style={styles.statLabel}>Series</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Horas de cine</Text>
            <Text style={styles.bigValue}>
              {summary.horas.toFixed(1).replace(".", ",")} h
            </Text>
            {summary.peliculasSinDuracion > 0 ? (
              <Text style={styles.cardHint}>
                {summary.peliculasSinDuracion} película
                {summary.peliculasSinDuracion === 1 ? "" : "s"} sin duración
              </Text>
            ) : null}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.cardHalf}>
              <Text style={styles.cardLabel}>Género top</Text>
              <Text style={styles.cardValue}>
                {summary.generoTop?.nombre ?? "Sin datos suficientes"}
              </Text>
              {summary.generoTop ? (
                <Text style={styles.cardHint}>
                  {summary.generoTop.obras} obras
                </Text>
              ) : null}
            </View>
            <View style={styles.cardHalf}>
              <Text style={styles.cardLabel}>Director top</Text>
              <Text style={styles.cardValue}>
                {summary.directorTop?.nombre ?? "Sin datos suficientes"}
              </Text>
              {summary.directorTop ? (
                <Text style={styles.cardHint}>
                  {summary.directorTop.obras} películas
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Mes más activo</Text>
            <Text style={styles.cardValue}>
              {summary.mesTop === null
                ? "Sin datos"
                : monthNames[summary.mesTop]}
            </Text>
            <View style={styles.barRow}>
              {summary.obrasPorMes.map((count, month) => (
                <View key={monthNames[month]} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height:
                            count === 0
                              ? 4
                              : `${Math.max(12, (count / Math.max(...summary.obrasPorMes)) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.monthText}>{monthNames[month]}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Obra destacada</Text>
            {summary.destacada ? (
              <>
                <Text style={styles.cardValue}>{summary.destacada.title}</Text>
                <Text style={styles.cardHint}>
                  ★ {summary.destacada.calificacion}/5
                </Text>
              </>
            ) : (
              <Text style={styles.cardValue}>
                Califica una obra para verla aquí
              </Text>
            )}
          </View>

          {summary.obrasSinDatos > 0 ? (
            <Text style={styles.incompleteText}>
              {summary.obrasSinDatos} obra
              {summary.obrasSinDatos === 1 ? "" : "s"} sin datos TMDB
            </Text>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  subtitle: { color: colors.muted, marginTop: 4, marginBottom: 16 },
  yearRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 12 },
  yearButton: {
    minHeight: 44,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  yearButtonSelected: { backgroundColor: colors.accent },
  yearText: { color: colors.muted, fontWeight: "700" },
  yearTextSelected: { color: colors.textDark },
  notice: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  noticeText: { color: colors.text },
  loading: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  status: { color: colors.muted, marginLeft: 10 },
  errorBox: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  errorTitle: { color: colors.paper, fontWeight: "800", marginBottom: 4 },
  errorText: { color: colors.paper },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  primaryButton: {
    minHeight: 44,
    backgroundColor: colors.accent,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: { color: colors.textDark, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  statCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: colors.surface,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  statValue: { color: colors.accent, fontSize: 24, fontWeight: "900" },
  statLabel: { color: colors.muted, marginTop: 4, textAlign: "center" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  cardHalf: {
    flex: 1,
    minHeight: 110,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  cardLabel: { color: colors.muted, fontWeight: "700", marginBottom: 6 },
  cardValue: { color: colors.text, fontSize: 18, fontWeight: "800" },
  bigValue: { color: colors.accent, fontSize: 34, fontWeight: "900" },
  cardHint: { color: colors.muted, marginTop: 6 },
  barRow: {
    height: 150,
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
  },
  barColumn: { flex: 1, alignItems: "center" },
  barTrack: {
    height: 112,
    width: "70%",
    justifyContent: "flex-end",
    backgroundColor: colors.surfaceRaised,
    borderRadius: 5,
    overflow: "hidden",
  },
  bar: { width: "100%", backgroundColor: colors.accent, borderRadius: 5 },
  monthText: { color: colors.muted, fontSize: 9, marginTop: 4 },
  incompleteText: {
    color: colors.dangerLight,
    textAlign: "center",
    marginTop: 8,
  },
});
