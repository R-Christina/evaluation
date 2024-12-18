using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.IO;

class Program
{
    static void Main(string[] args)
    {
        // Définir les chemins des fichiers
        string inputFilePath = @"D:\Donee.xlsx"; // Remplacez par le chemin exact de votre fichier d'entrée
        string outputFilePath = @"D:\sortie.xlsx"; // Remplacez par le chemin exact de votre fichier de sortie

        // Charger le fichier Excel d'entrée
        using (var package = new ExcelPackage(new FileInfo(inputFilePath)))
        {
            var worksheet = package.Workbook.Worksheets[0]; // Accéder à la première feuille (index 0)

            // Créer une liste pour stocker les lignes transformées
            var transformedRows = new List<List<object>>();

            // Parcourir les lignes du fichier Excel à partir de la ligne 4 (en partant de 1, la ligne 3 a les titres)
            for (int row = 4; row <= worksheet.Dimension.End.Row; row++)
            {
                // Extraire les données pour chaque matricule
                string matricule = worksheet.Cells[row, 2].Text; // Matricule dans la colonne 2
                string raIM1 = worksheet.Cells[row, 23].Text; // RA IM1 dans la colonne 23
                string realIM1 = worksheet.Cells[row, 24].Text; // Real IM1 dans la colonne 24
                string raIM2 = worksheet.Cells[row, 25].Text; // RA IM2 dans la colonne 25
                string realIM2 = worksheet.Cells[row, 26].Text; // Real IM2 dans la colonne 26
                string raIM3 = worksheet.Cells[row, 27].Text; // RA IM3 dans la colonne 27
                string realIM3 = worksheet.Cells[row, 28].Text; // Real IM3 dans la colonne 28

                // Ajouter chaque IM à une ligne distincte avec les valeurs appropriées
                transformedRows.Add(new List<object> { matricule, 2024, "IM1", raIM1, realIM1 });
                transformedRows.Add(new List<object> { matricule, 2024, "IM2", raIM2, realIM2 });
                transformedRows.Add(new List<object> { matricule, 2024, "IM3", raIM3, realIM3 });
            }

            // Créer une nouvelle feuille pour stocker les données transformées
            var transformedWorksheet = package.Workbook.Worksheets.Add("Transformed Data");

            // Ajouter les en-têtes de colonnes
            transformedWorksheet.Cells[1, 1].Value = "Matricule";
            transformedWorksheet.Cells[1, 2].Value = "Année";
            transformedWorksheet.Cells[1, 3].Value = "Name";
            transformedWorksheet.Cells[1, 4].Value = "ResultText";
            transformedWorksheet.Cells[1, 5].Value = "Result";

            // Insérer les données transformées dans la feuille
            int rowIndex = 2; // Début des données à la ligne 2
            foreach (var row in transformedRows)
            {
                transformedWorksheet.Cells[rowIndex, 1].Value = row[0];
                transformedWorksheet.Cells[rowIndex, 2].Value = row[1];
                transformedWorksheet.Cells[rowIndex, 3].Value = row[2];
                transformedWorksheet.Cells[rowIndex, 4].Value = row[3];
                transformedWorksheet.Cells[rowIndex, 5].Value = row[4];
                rowIndex++;
            }

            // Sauvegarder le fichier Excel transformé
            package.SaveAs(new FileInfo(outputFilePath));
        }

        Console.WriteLine("Transformation terminée et fichier sauvegardé.");
    }
}
