import React, { useState } from "react";
import { Text, View, TextInput, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
type Task = {
  id: string;
  title: string;
};

export default function Index() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);


  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), title: task }]);
      setTask("");
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f4f7", padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 20 }}>
        To-Do List
      </Text>

      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 8,
            padding: 10,
            marginRight: 10,
            fontSize: 16,
          }}
          placeholder="Add a task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#007BFF",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 8,
            justifyContent: "center",
          }}
          onPress={addTask}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 8,
              marginBottom: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 16, color: "#333" }}>{item.title}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={{ color: "#FF4D4D", fontSize: 16, fontWeight: "bold" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
            No tasks yet. Add a task to get started!
          </Text>
        )}
      />
    </View>
  );
}
